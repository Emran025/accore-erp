<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\Commercial\SalesLifecycle\Models\PosTerminal;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\SupplyChain\Inventory\Models\Warehouse;
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

        $requiredKeys = $this->currentRequirementKeys();
        $requiresWarehouse = in_array('warehouse', $requiredKeys, true);
        $requiresPosTerminal = in_array('pos_terminal', $requiredKeys, true);
        $requiresCostCenter = in_array('node_type:COST_CENTER', $requiredKeys, true);
        $requiresProfitCenter = in_array('node_type:PROFIT_CENTER', $requiredKeys, true);

        $warehouse = $context?->warehouse;
        $terminal = $context?->posTerminal;
        $costCenter = $context?->costCenter;
        $profitCenter = $context?->profitCenter;

        $workingUnitReadiness = $this->moduleReadinessService->validateWorkingUnit($context);
        $structuralReadiness = $this->moduleReadinessService->validateOperatingStructure($context, null, $requiredKeys);
        $accountingReadiness = $this->moduleReadinessService->accountingReadiness();
        $checks = [
            $this->check('working_unit', $workingUnitReadiness['ready']),
            $this->check('warehouse', ! $requiresWarehouse || ($warehouse !== null && $warehouse->is_active && $warehouse->status === 'active')),
            $this->check('cost_center', ! $requiresCostCenter || ($costCenter !== null && $costCenter->is_active)),
            $this->check('pos_terminal', ! $requiresPosTerminal || ($terminal !== null && $terminal->is_active && $terminal->status === 'active')),
            $this->check('organizational_structure', $structuralReadiness['ready']),
            $this->check('open_fiscal_period', $accountingReadiness['open_fiscal_period']['ready']),
            $this->check('chart_of_accounts', $accountingReadiness['chart_of_accounts']['ready']),
            $this->check('profit_center', ! $requiresProfitCenter || ($profitCenter !== null && $profitCenter->is_active)),
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
            $requiredKeys = $this->currentRequirementKeys();
            $requiresWarehouse = in_array('warehouse', $requiredKeys, true);
            $requiresPosTerminal = in_array('pos_terminal', $requiredKeys, true);
            $requiresCostCenter = in_array('node_type:COST_CENTER', $requiredKeys, true);
            $requiresProfitCenter = in_array('node_type:PROFIT_CENTER', $requiredKeys, true);

            $existing = OperatingContext::query()
                ->with(['warehouse', 'posTerminal', 'costCenter', 'profitCenter'])
                ->where('user_id', $userId)
                ->where('org_node_uuid', $data['org_node_uuid'])
                ->first();

            $posWasSubmitted = array_key_exists('pos_terminal_id', $data);
            $warehouseWasSubmitted = array_key_exists('warehouse_id', $data);
            $terminalId = $posWasSubmitted
                ? ($data['pos_terminal_id'] === null ? null : (int) $data['pos_terminal_id'])
                : ($warehouseWasSubmitted ? null : $existing?->pos_terminal_id);
            $terminal = null;

            if ($terminalId !== null) {
                $terminal = PosTerminal::query()->with('warehouse')->whereKey($terminalId)->first();
                if (! $terminal || ! $terminal->is_active || $terminal->status !== 'active') {
                    throw ValidationException::withMessages([
                        'pos_terminal_id' => ['The selected POS terminal must be active.'],
                    ]);
                }
            } elseif (! $posWasSubmitted && ! $warehouseWasSubmitted && $existing?->posTerminal) {
                $candidate = $existing->posTerminal;
                if ($candidate->is_active && $candidate->status === 'active') {
                    $terminal = $candidate->loadMissing('warehouse');
                }
            }

            $warehouseId = $terminal?->warehouse_id
                ?? ($warehouseWasSubmitted
                    ? ($data['warehouse_id'] === null ? null : (int) $data['warehouse_id'])
                    : $existing?->warehouse_id);
            $warehouse = $warehouseId === null ? null : Warehouse::query()->whereKey($warehouseId)->first();
            if ($warehouseId !== null && (! $warehouse || ! $warehouse->is_active || $warehouse->status !== 'active')) {
                throw ValidationException::withMessages([
                    'warehouse_id' => ['The selected warehouse must be active.'],
                ]);
            }

            if ($posWasSubmitted && $data['pos_terminal_id'] !== null && $warehouseWasSubmitted
                && $data['warehouse_id'] !== null && (int) $data['warehouse_id'] !== (int) $terminal?->warehouse_id) {
                throw ValidationException::withMessages([
                    'warehouse_id' => ['The selected warehouse must match the warehouse already assigned to this POS terminal.'],
                ]);
            }

            if ($requiresWarehouse && ! $warehouse) {
                throw ValidationException::withMessages([
                    'warehouse_id' => ['Select an existing active warehouse required by the selected operating scenario.'],
                ]);
            }
            if ($requiresPosTerminal && ! $terminal) {
                throw ValidationException::withMessages([
                    'pos_terminal_id' => ['Select an existing active POS terminal required by the selected operating scenario.'],
                ]);
            }

            if ($warehouse && $warehouse->org_node_uuid !== $data['org_node_uuid']) {
                throw ValidationException::withMessages([
                    'warehouse_id' => ['The selected warehouse must already belong to the chosen operating unit.'],
                ]);
            }
            if ($terminal && $terminal->org_node_uuid !== $data['org_node_uuid']) {
                throw ValidationException::withMessages([
                    'pos_terminal_id' => ['The selected POS terminal must already belong to the chosen operating unit.'],
                ]);
            }
            if ($terminal && (! $warehouse || (int) $terminal->warehouse_id !== (int) $warehouse->id)) {
                throw ValidationException::withMessages([
                    'pos_terminal_id' => ['The selected POS terminal must belong to an active warehouse.'],
                ]);
            }

            $submittedCostCenterId = $data['cost_center_id'] ?? null;
            $costCenterId = $submittedCostCenterId
                ?? $terminal?->cost_center_id
                ?? $warehouse?->cost_center_id
                ?? $existing?->cost_center_id;
            if ($terminal && $submittedCostCenterId !== null && (int) $submittedCostCenterId !== (int) $terminal->cost_center_id) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['The selected cost center must match the center already assigned to this POS terminal.'],
                ]);
            }
            if ($warehouse && $submittedCostCenterId !== null && (int) $submittedCostCenterId !== (int) $warehouse->cost_center_id) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['The selected cost center must match the center already assigned to this warehouse.'],
                ]);
            }
            if ($requiresCostCenter && ! $costCenterId) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['An active cost center is required by the selected module and operating scenario.'],
                ]);
            }
            $costCenter = $costCenterId === null
                ? null
                : CostCenter::query()->whereKey($costCenterId)->where('is_active', true)->first();
            if ($costCenterId !== null && ! $costCenter) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['The selected cost center must be active.'],
                ]);
            }

            if ($terminal) {
                $submittedProfitCenterId = $data['profit_center_id'] ?? null;
                if ($submittedProfitCenterId !== null && (int) $submittedProfitCenterId !== (int) $terminal->profit_center_id) {
                    throw ValidationException::withMessages([
                        'profit_center_id' => ['The profit center is derived from the selected POS terminal and cannot conflict with it.'],
                    ]);
                }
                $profitCenterId = $terminal->profit_center_id;
            } elseif ($warehouse) {
                $submittedProfitCenterId = $data['profit_center_id'] ?? null;
                if ($submittedProfitCenterId !== null && (int) $submittedProfitCenterId !== (int) $warehouse->profit_center_id) {
                    throw ValidationException::withMessages([
                        'profit_center_id' => ['The profit center must match the center already assigned to this warehouse.'],
                    ]);
                }
                $profitCenterId = $submittedProfitCenterId ?? $warehouse->profit_center_id;
            } elseif (array_key_exists('profit_center_id', $data)) {
                $profitCenterId = $data['profit_center_id'];
            } else {
                $profitCenterId = $existing?->profit_center_id;
            }

            if ($requiresProfitCenter && ! $profitCenterId) {
                throw ValidationException::withMessages([
                    'profit_center_id' => ['An active profit center is required by the selected module and operating scenario.'],
                ]);
            }
            $profitCenter = $profitCenterId === null
                ? null
                : ProfitCenter::query()->whereKey($profitCenterId)->where('is_active', true)->first();
            if ($profitCenterId !== null && ! $profitCenter) {
                throw ValidationException::withMessages([
                    'profit_center_id' => ['The selected profit center must be active.'],
                ]);
            }

            if ($warehouse && $costCenter && $requiresCostCenter && (int) $warehouse->cost_center_id !== (int) $costCenter->id) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['The warehouse must already be assigned to the selected active cost center.'],
                ]);
            }
            if ($warehouse && $profitCenter && $requiresProfitCenter && (int) $warehouse->profit_center_id !== (int) $profitCenter->id) {
                throw ValidationException::withMessages([
                    'profit_center_id' => ['The warehouse must already be assigned to the selected active profit center.'],
                ]);
            }
            if ($terminal && $costCenter && $requiresCostCenter && (int) $terminal->cost_center_id !== (int) $costCenter->id) {
                throw ValidationException::withMessages([
                    'cost_center_id' => ['The POS terminal must already be assigned to the selected active cost center.'],
                ]);
            }
            if ($terminal && $profitCenter && $requiresProfitCenter && (int) $terminal->profit_center_id !== (int) $profitCenter->id) {
                throw ValidationException::withMessages([
                    'profit_center_id' => ['The POS terminal must already be assigned to the selected active profit center.'],
                ]);
            }

            if ($terminal) {
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
                    throw ValidationException::withMessages([
                        'pos_terminal_id' => ['The selected POS terminal is already assigned to another user context.'],
                    ]);
                }
            }

            $candidate = new OperatingContext([
                'org_node_uuid' => $data['org_node_uuid'],
                'warehouse_id' => $warehouse?->id,
                'pos_terminal_id' => $terminal?->id,
                'cost_center_id' => $costCenter?->id,
                'profit_center_id' => $profitCenter?->id,
            ]);
            $workingUnitReadiness = $this->moduleReadinessService->validateWorkingUnit($candidate);
            if (! $workingUnitReadiness['ready']) {
                throw ValidationException::withMessages([
                    'org_node_uuid' => $workingUnitReadiness['reason_codes'],
                ]);
            }
            $structuralReadiness = $this->moduleReadinessService->validateOperatingStructure($candidate, null, $requiredKeys);
            if (! $structuralReadiness['ready']) {
                throw ValidationException::withMessages([
                    'operating_context' => $structuralReadiness['reason_codes'],
                ]);
            }

            OperatingContext::query()
                ->where('user_id', $userId)
                ->where('is_default', true)
                ->update(['is_default' => false]);

            $context = OperatingContext::query()->updateOrCreate(
                ['user_id' => $userId, 'org_node_uuid' => $data['org_node_uuid']],
                [
                    'org_node_uuid' => $data['org_node_uuid'],
                    'warehouse_id' => $warehouse?->id,
                    'pos_terminal_id' => $terminal?->id,
                    'cost_center_id' => $costCenter?->id,
                    'profit_center_id' => $profitCenter?->id,
                    // Status is recalculated from authoritative live readiness;
                    // request submission is never proof of readiness.
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

    /** @return list<string> */
    private function currentRequirementKeys(): array
    {
        $moduleKeys = ModuleSelectionService::selectedModuleKeysFromStore();

        return array_column($this->moduleReadinessService->resolveRequirementQueue($moduleKeys), 'key');
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
