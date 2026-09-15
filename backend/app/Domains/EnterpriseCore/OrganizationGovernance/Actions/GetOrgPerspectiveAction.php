<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;

class GetOrgPerspectiveAction
{
    /**
     * @param string $perspectiveKey
     * @param array<string, mixed> $params
     * @return array<string, mixed>
     */
    public function execute(string $perspectiveKey, array $params = []): array
    {
        $perspectiveKey = strtolower(trim($perspectiveKey));
        $asOfDate = $params['date'] ?? now()->toDateString();

        // 1. Fetch all active structure nodes
        $allNodes = StructureNode::where('status', 'active')
            ->with(['legalEntity', 'metaType'])
            ->get();

        // 2. Filter nodes and links based on perspective
        $filteredNodes = [];
        $relevantPlanes = [];

        switch ($perspectiveKey) {
            case 'legal':
                $relevantPlanes = ['LEGAL_OWNERSHIP', 'OPERATIONAL_HIERARCHY'];
                $filteredNodes = $allNodes->filter(function ($n) {
                    return $n->hasFacet('legal_entity') || in_array($n->node_type_id, ['legal_entity', 'holding_company', 'operating_company']);
                });
                break;

            case 'facilities':
                $relevantPlanes = ['GEOGRAPHIC_CONTAINMENT', 'OPERATIONAL_HIERARCHY'];
                $filteredNodes = $allNodes->filter(function ($n) {
                    return $n->hasFacet('facility') || $n->hasFacet('warehouse') || in_array($n->node_type_id, ['store', 'warehouse', 'branch', 'facility', 'plant', 'depot']);
                });
                break;

            case 'workforce':
                $relevantPlanes = ['OPERATIONAL_HIERARCHY'];
                $filteredNodes = $allNodes->filter(function ($n) {
                    return $n->hasFacet('department') || in_array($n->node_type_id, ['division', 'department', 'team', 'branch', 'headquarters']);
                });
                break;

            case 'financial':
                $relevantPlanes = ['FINANCIAL_ROLLUP', 'OPERATIONAL_HIERARCHY'];
                $filteredNodes = $allNodes->filter(function ($n) {
                    return $n->hasFacet('cost_center') || $n->hasFacet('profit_center') || in_array($n->node_type_id, ['company_code', 'controlling_area', 'cost_center', 'profit_center', 'legal_entity']);
                });
                break;

            case 'matrix':
                $relevantPlanes = ['FUNCTIONAL_MATRIX', 'PROJECT_ASSIGNMENT'];
                $matrixNodeUuids = StructureLink::activeOnDate($asOfDate)
                    ->whereIn('plane_type', $relevantPlanes)
                    ->pluck('source_node_uuid')
                    ->merge(
                        StructureLink::activeOnDate($asOfDate)
                            ->whereIn('plane_type', $relevantPlanes)
                            ->pluck('target_node_uuid')
                    )
                    ->unique();

                $filteredNodes = $allNodes->whereIn('node_uuid', $matrixNodeUuids);
                break;

            case 'all':
            default:
                $relevantPlanes = ['OPERATIONAL_HIERARCHY', 'LEGAL_OWNERSHIP', 'GEOGRAPHIC_CONTAINMENT', 'FUNCTIONAL_MATRIX', 'PROJECT_ASSIGNMENT', 'FINANCIAL_ROLLUP'];
                $filteredNodes = $allNodes;
                break;
        }

        // Fallback if empty to keep studio usable
        if ($filteredNodes->isEmpty() && $perspectiveKey !== 'matrix') {
            $filteredNodes = $allNodes;
        }

        $nodeUuids = $filteredNodes->pluck('node_uuid')->all();

        // 3. Fetch active links for the perspective
        $links = StructureLink::activeOnDate($asOfDate)
            ->whereIn('plane_type', $relevantPlanes)
            ->whereIn('source_node_uuid', $nodeUuids)
            ->whereIn('target_node_uuid', $nodeUuids)
            ->get();

        // 4. Identify Root Nodes (nodes without a parent link in this perspective)
        $childUuids = $links->pluck('source_node_uuid')->unique()->all();
        $rootNodes = $filteredNodes->reject(function ($n) use ($childUuids) {
            return in_array($n->node_uuid, $childUuids, true);
        })->values();

        // 5. Build summary metrics
        $facetCounts = [];
        foreach ($filteredNodes as $node) {
            $facets = (array) ($node->facets_json ?? []);
            foreach ($facets as $f) {
                $facetCounts[$f] = ($facetCounts[$f] ?? 0) + 1;
            }
        }

        return [
            'perspective'  => $perspectiveKey,
            'as_of_date'   => $asOfDate,
            'nodes'        => $filteredNodes->values(),
            'links'        => $links->values(),
            'root_nodes'   => $rootNodes,
            'statistics'   => [
                'total_nodes'  => $filteredNodes->count(),
                'total_links'  => $links->count(),
                'root_count'   => $rootNodes->count(),
                'facet_counts' => $facetCounts,
            ],
        ];
    }
}
