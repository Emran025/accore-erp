<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OperatingContextService
{
    public function __construct(private readonly ModuleReadinessService $moduleReadinessService)
    {
    }

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

        $workingUnitReadiness = $this->moduleReadinessService->validateWorkingUnit($context);
        $structuralReadiness = $this->moduleReadinessService->validateOperatingStructure($context);
        $accountingReadiness = $this->moduleReadinessService->accountingReadiness();
        $checks = [
            $this->check('working_unit', $workingUnitReadiness['ready']),
            $this->check('warehouse', $warehouse !== null && $warehouse->is_active && $warehouse->status === 'active'),
            $this->check('cost_center', $costCenter !== null && $costCenter->is_active),
            $this->check('pos_terminal', $terminal !== null && $terminal->is_active && $terminal->status === 'active'),
            $this->check('organizational_structure', $structuralReadiness['ready']),
            $this->check('open_fiscal_period', $accountingReadiness['open_fiscal_period']['ready']),
            $this->check('chart_of_accounts', $accountingReadiness['chart_of_accounts']['ready']),
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
            'working_unit_readiness' => $workingUnitReadiness,
            'structural_readiness' => $structuralReadiness,
            'accounting_readiness' => $accountingReadiness,
        ];
    }

    public function configure(array $data, ?int $userId): OperatingContext
    {
        return DB::transaction(function () use ($data, $userId) {
            $costCenter = CostCenter::query()->whereKey($data['cost_center_id'])->where('is_active', true)->first();
            if (!$costCenter) {
                throw ValidationException::withMessages(['cost_center_id' => ['The selected cost center must be active.']]);
            }
            $terminal = PosTerminal::query()
                ->whereKey($data['pos_terminal_id'])
                ->where('is_active', true)
                ->where('status', 'active')
                ->firstOrFail();
            $warehouse = $terminal?->warehouse;

            if (!$warehouse || !$warehouse->is_active || $warehouse->status !== 'active') {
                throw ValidationException::withMessages(['pos_terminal_id' => ['The selected POS terminal must belong to an active warehouse.']]);
            }
            if ($terminal->org_node_uuid !== $data['org_node_uuid'] || $warehouse->org_node_uuid !== $data['org_node_uuid']) {
                throw ValidationException::withMessages(['pos_terminal_id' => ['The selected POS terminal and warehouse must already belong to the chosen operating unit.']]);
            }
            if ($terminal->cost_center_id !== $costCenter->id || $warehouse->cost_center_id !== $costCenter->id) {
                throw ValidationException::withMessages(['cost_center_id' => ['The selected POS terminal and warehouse must already be assigned to the selected active cost center.']]);
            }
            $sharedWithAnotherUser = OperatingContext::query()
                ->where('pos_terminal_id', $terminal->id)
                ->where(function ($query) use ($userId) {
                    if ($userId === null) {
                        $query->whereNotNull('user_id');
                    } else {
                        $query->whereNull('user_id')->orWhere('user_id', '!=', $userId);
                    }
                })
                ->exists();
            if ($sharedWithAnotherUser) {
                throw ValidationException::withMessages(['pos_terminal_id' => ['The selected POS terminal is already assigned to another user context.']]);
            }

            OperatingContext::query()
                ->where('user_id', $userId)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $context = OperatingContext::query()->updateOrCreate(
                ['user_id' => $userId, 'org_node_uuid' => $data['org_node_uuid']],
                [
                    'org_node_uuid' => $data['org_node_uuid'] ?? null,
                    'warehouse_id' => $warehouse?->id,
                    'cost_center_id' => $data['cost_center_id'] ?? null,
                    'profit_center_id' => $terminal->profit_center_id,
                    // Status is recalculated from the authoritative readiness
                    // contract below; configuration submission is never proof of readiness.
                    'status' => 'draft',
                    'is_default' => true,
                ]
            );

            $context->load(['warehouse', 'posTerminal', 'costCenter', 'profitCenter']);
            $readiness = $this->readiness($userId);
            $context->update([
                'status' => $readiness['status'],
                'readiness_json' => [
                    'ready' => $readiness['ready'],
                    'status' => $readiness['status'],
                    'checks' => $readiness['checks'],
                    'missing' => $readiness['missing'],
                    'working_unit_readiness' => $readiness['working_unit_readiness'],
                    'structural_readiness' => $readiness['structural_readiness'],
                    'accounting_readiness' => $readiness['accounting_readiness'],
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
