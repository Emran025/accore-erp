<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\TopologyRule;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Compiles an intermediate OrganizationBlueprint atomically into live production
 * database records across graph and relational tables.
 */
class BlueprintCompiler
{
    public function __construct(
        private readonly OrgNodeClosureService $closureService,
        private readonly OrgStructureService $orgStructureService,
    ) {
    }

    /**
     * Compile a staged blueprint into production records.
     *
     * @param array<string, mixed> $blueprint
     * @param int|null $userId
     * @return array<string, mixed>
     * @throws ValidationException
     */
    public function compile(array $blueprint, ?int $userId = null): array
    {
        return DB::transaction(function () use ($blueprint, $userId) {
            $idMap = [
                'nodes'          => [],
                'cost_centers'   => [],
                'profit_centers' => [],
                'warehouses'     => [],
            ];

            // 1. Root CLIENT Node
            $client = StructureNode::where('node_type_id', 'CLIENT')->first();
            if (!$client) {
                $client = StructureNode::create([
                    'node_uuid'    => (string) Str::uuid(),
                    'node_type_id' => 'CLIENT',
                    'code'         => 'CLIENT-ROOT',
                    'name_en'      => 'Enterprise Client Root',
                    'name_ar'      => 'العميل التنظيمي الرئيسي للمنشأة',
                    'status'       => 'active',
                    'valid_from'   => now()->toDateString(),
                    'created_by'   => $userId,
                ]);
            }

            // 2. Compile Structure Nodes
            $units = (array) ($blueprint['units'] ?? []);
            foreach ($units as $unit) {
                $tempId = $unit['temp_id'];
                $nodeUuid = (string) Str::uuid();
                $idMap['nodes'][$tempId] = $nodeUuid;

                $node = StructureNode::create([
                    'node_uuid'       => $nodeUuid,
                    'node_type_id'    => $unit['type_id'],
                    'code'            => $unit['code'],
                    'name_en'         => $unit['name_en'] ?? $unit['code'],
                    'name_ar'         => $unit['name_ar'] ?? $unit['code'],
                    'attributes_json' => $unit['attributes'] ?? [],
                    'facets_json'     => $unit['facets'] ?? [],
                    'status'          => 'active',
                    'is_locked'       => (bool) ($unit['is_user_locked'] ?? false),
                    'valid_from'      => now()->toDateString(),
                    'created_by'      => $userId,
                ]);

                // Link COMP_CODE to CLIENT if not linked
                if ($unit['type_id'] === 'COMP_CODE') {
                    $rule = TopologyRule::where('source_node_type_id', 'COMP_CODE')
                        ->where('target_node_type_id', 'CLIENT')
                        ->first();

                    StructureLink::create([
                        'source_node_uuid' => $nodeUuid,
                        'target_node_uuid' => $client->node_uuid,
                        'topology_rule_id' => $rule?->id,
                        'link_type'        => 'assignment',
                        'plane_type'       => 'LEGAL_OWNERSHIP',
                        'valid_from'       => now()->toDateString(),
                        'created_by'       => $userId,
                    ]);
                }
            }

            // 3. Compile Facets to Relational Domain Records
            foreach ($units as $unit) {
                $tempId = $unit['temp_id'];
                $nodeUuid = $idMap['nodes'][$tempId];
                $facets = (array) ($unit['facets'] ?? []);

                $costCenter = null;
                $profitCenter = null;
                $warehouse = null;

                // Financial Responsibility Facet
                if (in_array('FinancialResponsibilityFacet', $facets, true)) {
                    $costCenter = CostCenter::create([
                        'structure_node_uuid' => $nodeUuid,
                        'code'                => 'CC-' . $unit['code'],
                        'name'                => $unit['name_ar'] ?? $unit['code'],
                        'name_en'             => $unit['name_en'] ?? $unit['code'],
                        'type'                => 'operational',
                        'is_active'           => true,
                        'created_by'          => $userId,
                    ]);
                    $idMap['cost_centers'][$tempId] = $costCenter->id;

                    $profitCenter = ProfitCenter::create([
                        'structure_node_uuid' => $nodeUuid,
                        'code'                => 'PC-' . $unit['code'],
                        'name'                => $unit['name_ar'] ?? $unit['code'],
                        'name_en'             => $unit['name_en'] ?? $unit['code'],
                        'type'                => 'business_unit',
                        'is_active'           => true,
                        'created_by'          => $userId,
                    ]);
                    $idMap['profit_centers'][$tempId] = $profitCenter->id;
                }

                // Operational Facility Facet
                if (in_array('OperationalFacilityFacet', $facets, true)) {
                    $warehouse = Warehouse::create([
                        'org_node_uuid'    => $nodeUuid,
                        'cost_center_id'   => $costCenter?->id,
                        'profit_center_id' => $profitCenter?->id,
                        'code'             => 'WH-' . $unit['code'],
                        'name'             => $unit['name_ar'] ?? $unit['code'],
                        'name_en'          => $unit['name_en'] ?? $unit['code'],
                        'status'           => 'active',
                        'is_active'        => true,
                        'created_by'       => $userId,
                    ]);
                    $idMap['warehouses'][$tempId] = $warehouse->id;
                }

                // Commercial Branch Facet
                if (in_array('CommercialBranchFacet', $facets, true)) {
                    $posCount = max(1, (int) ($unit['attributes']['pos_terminal_count'] ?? 1));
                    $targetWarehouseId = $warehouse?->id ?? (reset($idMap['warehouses']) ?: null);

                    if ($targetWarehouseId) {
                        for ($p = 1; $p <= $posCount; $p++) {
                            PosTerminal::create([
                                'org_node_uuid'    => $nodeUuid,
                                'warehouse_id'     => $targetWarehouseId,
                                'cost_center_id'   => $costCenter?->id,
                                'profit_center_id' => $profitCenter?->id,
                                'code'             => 'POS-' . $unit['code'] . '-' . str_pad((string) $p, 2, '0', STR_PAD_LEFT),
                                'name'             => ($unit['name_ar'] ?? $unit['code']) . " — كاشير {$p}",
                                'name_en'          => ($unit['name_en'] ?? $unit['code']) . " — POS #{$p}",
                                'status'           => 'active',
                                'is_active'        => true,
                                'created_by'       => $userId,
                            ]);
                        }
                    }
                }
            }

            // 4. Compile Directed Graph Relationships
            $relationships = (array) ($blueprint['relationships'] ?? []);
            foreach ($relationships as $rel) {
                $srcTemp = $rel['source_temp_id'] ?? null;
                $tgtTemp = $rel['target_temp_id'] ?? null;

                if (!isset($idMap['nodes'][$srcTemp]) || !isset($idMap['nodes'][$tgtTemp])) {
                    continue;
                }

                $sourceUuid = $idMap['nodes'][$srcTemp];
                $targetUuid = $idMap['nodes'][$tgtTemp];

                $srcNode = StructureNode::find($sourceUuid);
                $tgtNode = StructureNode::find($targetUuid);

                $rule = TopologyRule::where('source_node_type_id', $srcNode->node_type_id)
                    ->where('target_node_type_id', $tgtNode->node_type_id)
                    ->first();

                StructureLink::create([
                    'source_node_uuid' => $sourceUuid,
                    'target_node_uuid' => $targetUuid,
                    'topology_rule_id' => $rule?->id,
                    'link_type'        => $rel['link_type'] ?? 'assignment',
                    'plane_type'       => $rel['plane_type'] ?? 'OPERATIONAL_HIERARCHY',
                    'priority'         => (int) ($rel['priority'] ?? 0),
                    'valid_from'       => now()->toDateString(),
                    'created_by'       => $userId,
                ]);
            }

            // 5. Compile Positions
            $positions = (array) ($blueprint['positions'] ?? []);
            $defaultRole = Role::first();

            foreach ($positions as $pos) {
                $unitTemp = $pos['unit_temp_id'] ?? null;
                $costCenterId = $idMap['cost_centers'][$unitTemp] ?? null;

                Position::create([
                    'position_code'    => $pos['position_code'] ?? Position::generateCode(),
                    'position_name_ar' => $pos['title_ar'] ?? 'منصب وظيفي جديد',
                    'position_name_en' => $pos['title_en'] ?? 'New Position',
                    'role_id'          => $defaultRole?->id,
                    'cost_center_id'   => $costCenterId,
                    'is_active'        => true,
                    'created_by'       => $userId,
                ]);
            }

            // 6. Bootstrap Initial Operating Context
            $firstWarehouseId = reset($idMap['warehouses']) ?: null;
            $firstCostCenterId = reset($idMap['cost_centers']) ?: null;
            $firstProfitCenterId = reset($idMap['profit_centers']) ?: null;
            $firstNodeUuid = reset($idMap['nodes']) ?: null;
            $firstPos = PosTerminal::first();

            OperatingContext::updateOrCreate(
                ['user_id' => $userId, 'is_default' => true],
                [
                    'org_node_uuid'    => $firstNodeUuid,
                    'warehouse_id'     => $firstWarehouseId,
                    'pos_terminal_id'  => $firstPos?->id,
                    'cost_center_id'   => $firstCostCenterId,
                    'profit_center_id' => $firstProfitCenterId,
                    'status'           => 'ready',
                    'is_default'       => true,
                ]
            );

            // 7. Rebuild Transitive Closures
            $this->closureService->rebuildClosures();

            // 8. Persist Blueprint Record as Published
            $blueprintUuid = $blueprint['blueprint_id'] ?? (string) Str::uuid();
            OrgBlueprint::updateOrCreate(
                ['blueprint_uuid' => $blueprintUuid],
                [
                    'name'              => $blueprint['business_profile']['company_name'] ?? 'Organization Blueprint',
                    'status'            => 'published',
                    'complexity_grade'  => (int) ($blueprint['metadata']['complexity_grade'] ?? 1),
                    'primary_archetype' => $blueprint['metadata']['primary_archetype'] ?? 'SIMPLE_HIERARCHY',
                    'blueprint_json'    => $blueprint,
                    'created_by'        => $userId,
                    'published_at'      => now(),
                ]
            );

            // 9. Record Change in Audit History
            $this->orgStructureService->recordChange(
                'blueprint',
                $blueprintUuid,
                'published',
                null,
                ['units_compiled' => count($units), 'links_compiled' => count($relationships)],
                'Organization Blueprint published and compiled into live structure'
            );

            return [
                'success'          => true,
                'blueprint_uuid'   => $blueprintUuid,
                'compiled_counts'  => [
                    'nodes'        => count($idMap['nodes']),
                    'cost_centers' => count($idMap['cost_centers']),
                    'warehouses'   => count($idMap['warehouses']),
                ],
                'operating_ready'  => true,
            ];
        });
    }
}
