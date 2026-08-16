<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class OperatingContextService
{
    public function readiness(?int $userId): array
    {
        $context = OperatingContext::query()
            ->with(['warehouse', 'posTerminal', 'costCenter', 'profitCenter'])
            ->where('is_default', true)
            ->where(function ($query) use ($userId) {
                if ($userId !== null) {
                    $query->where('user_id', $userId)->orWhereNull('user_id');
                } else {
                    $query->whereNull('user_id');
                }
            })
            ->orderByRaw('user_id is null')
            ->first();

        $warehouse = $context?->warehouse;
        $terminal = $context?->posTerminal;
        $costCenter = $context?->costCenter;
        $profitCenter = $context?->profitCenter;

        $hasActiveOrganizationLocation = $context !== null
            && $context->org_node_uuid !== null
            && StructureNode::query()
                ->where('node_uuid', $context->org_node_uuid)
                ->where('status', 'active')
                ->exists();

        $checks = [
            $this->check('org_node', $hasActiveOrganizationLocation),
            $this->check(
                'warehouse',
                $warehouse !== null
                    && $warehouse->is_active
                    && $warehouse->status === 'active'
                    && $warehouse->org_node_uuid === $context?->org_node_uuid
            ),
            $this->check('cost_center', $costCenter !== null && $costCenter->is_active),
            $this->check('profit_center', $profitCenter !== null && $profitCenter->is_active),
            $this->check(
                'pos_terminal',
                $terminal !== null
                    && $terminal->is_active
                    && $terminal->status === 'active'
                    && $terminal->org_node_uuid === $context?->org_node_uuid
                    && $terminal->warehouse_id === $warehouse?->id
            ),
        ];

        $missing = collect($checks)->where('complete', false)->values()->all();
        $ready = count($missing) === 0;

        return [
            'ready' => $ready,
            'status' => $ready ? 'ready' : 'draft',
            'context' => $context,
            'checks' => $checks,
            'missing' => $missing,
            'next_action' => $missing[0]['key'] ?? null,
        ];
    }

    public function configure(array $data, ?int $userId): OperatingContext
    {
        return DB::transaction(function () use ($data, $userId) {
            $warehouseData = Arr::get($data, 'warehouse', []);
            $warehouse = Warehouse::query()->updateOrCreate(
                ['code' => $warehouseData['code']],
                [
                    'name' => $warehouseData['name'],
                    'name_en' => $warehouseData['name_en'] ?? null,
                    'org_node_uuid' => $data['org_node_uuid'] ?? null,
                    'cost_center_id' => $data['cost_center_id'] ?? null,
                    'profit_center_id' => $data['profit_center_id'] ?? null,
                    'status' => 'active',
                    'is_active' => true,
                    'description' => $warehouseData['description'] ?? null,
                    'created_by' => $userId,
                ]
            );

            $terminalData = Arr::get($data, 'pos_terminal', []);
            $terminal = PosTerminal::query()->updateOrCreate(
                ['code' => $terminalData['code']],
                [
                    'name' => $terminalData['name'],
                    'name_en' => $terminalData['name_en'] ?? null,
                    'org_node_uuid' => $data['org_node_uuid'] ?? null,
                    'warehouse_id' => $warehouse->id,
                    'cost_center_id' => $data['cost_center_id'] ?? null,
                    'profit_center_id' => $data['profit_center_id'] ?? null,
                    'status' => 'active',
                    'is_active' => true,
                    'created_by' => $userId,
                ]
            );

            OperatingContext::query()
                ->where('user_id', $userId)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $context = OperatingContext::query()->updateOrCreate(
                ['user_id' => $userId, 'pos_terminal_id' => $terminal->id],
                [
                    'org_node_uuid' => $data['org_node_uuid'] ?? null,
                    'warehouse_id' => $warehouse->id,
                    'cost_center_id' => $data['cost_center_id'] ?? null,
                    'profit_center_id' => $data['profit_center_id'] ?? null,
                    'status' => 'ready',
                    'is_default' => true,
                ]
            );

            $context->load(['warehouse', 'posTerminal', 'costCenter', 'profitCenter']);
            $readiness = $this->readiness($userId);
            $context->update([
                'status' => $readiness['ready'] ? 'ready' : 'draft',
                'readiness_json' => [
                    'ready' => $readiness['ready'],
                    'status' => $readiness['status'],
                    'checks' => $readiness['checks'],
                    'missing' => $readiness['missing'],
                ],
            ]);

            return $context->fresh(['warehouse', 'posTerminal', 'costCenter', 'profitCenter']);
        });
    }

    public function setDefaultContext(int $contextId, ?int $userId): OperatingContext
    {
        return DB::transaction(function () use ($contextId, $userId) {
            $context = OperatingContext::query()
                ->when($userId !== null, fn ($query) => $query->where('user_id', $userId))
                ->findOrFail($contextId);

            OperatingContext::query()
                ->where('user_id', $userId)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $context->update(['is_default' => true]);

            return $context->fresh(['warehouse', 'posTerminal', 'costCenter', 'profitCenter']);
        });
    }

    private function check(string $key, bool $complete): array
    {
        return [
            'key' => $key,
            'complete' => $complete,
            'action_key' => $complete ? null : "operating_context.readiness.{$key}",
        ];
    }
}
