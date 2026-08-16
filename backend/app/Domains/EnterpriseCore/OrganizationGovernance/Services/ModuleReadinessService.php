<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Services;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OperatingContext;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use Illuminate\Support\Collection;

class ModuleReadinessService
{
    public function __construct(private readonly OrgStructureService $orgStructureService)
    {
    }

    /**
     * Return an authoritative configuration state for every configured module.
     * Activation only indicates that a feature is enabled. Readiness additionally
     * requires the persisted organizational prerequisites and relevant integrity
     * checks to pass.
     */
    public function evaluate(?int $userId = null): array
    {
        $integrityIssues = $this->orgStructureService->runIntegrityCheck();
        $activeNodeTypes = StructureNode::query()
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('valid_from')->orWhere('valid_from', '<=', now()->toDateString());
            })
            ->where(function ($query) {
                $query->whereNull('valid_to')->orWhere('valid_to', '>=', now()->toDateString());
            })
            ->pluck('node_type_id')
            ->unique()
            ->values()
            ->all();

        $context = $this->defaultContext($userId);
        $operatingStructure = $this->validateOperatingStructure($context, $integrityIssues);
        $accountingReadiness = $this->accountingReadiness();
        $modules = Module::query()->orderBy('category')->orderBy('sort_order')->get();

        $evaluated = $modules->map(function (Module $module) use ($activeNodeTypes, $integrityIssues, $operatingStructure, $accountingReadiness) {
            $requirements = $module->readiness_requirements ?? $this->defaultRequirements();
            $requiredNodeTypes = array_values($requirements['required_node_types'] ?? []);
            $missingNodeTypes = array_values(array_diff($requiredNodeTypes, $activeNodeTypes));
            $relevantIssues = $this->relevantIntegrityIssues($integrityIssues, $requiredNodeTypes);
            $requiresOperatingContext = (bool) ($requirements['requires_operating_context'] ?? false);
            $requiresOpenFiscalPeriod = (bool) ($requirements['requires_open_fiscal_period'] ?? false);
            $requiresChartOfAccounts = (bool) ($requirements['requires_chart_of_accounts'] ?? false);

            $reasons = [];
            if (!$module->is_active) {
                $reasons[] = 'module_inactive';
            }
            if ($missingNodeTypes !== []) {
                $reasons[] = 'missing_required_structure';
            }
            if ($relevantIssues !== []) {
                $reasons[] = 'structure_integrity_failure';
            }
            if ($requiresOperatingContext && !$operatingStructure['ready']) {
                $reasons[] = 'operating_context_structure_invalid';
            }
            if ($requiresOpenFiscalPeriod && !$accountingReadiness['open_fiscal_period']['ready']) {
                $reasons[] = $accountingReadiness['open_fiscal_period']['reason_code'];
            }
            if ($requiresChartOfAccounts && !$accountingReadiness['chart_of_accounts']['ready']) {
                $reasons[] = 'missing_chart_of_accounts';
            }

            $ready = $module->is_active && $reasons === [];

            return [
                'module_key' => $module->module_key,
                'category' => $module->category,
                'is_active' => (bool) $module->is_active,
                'requires_org_structure' => (bool) ($requirements['requires_org_structure'] ?? false),
                'requires_operating_context' => $requiresOperatingContext,
                'requires_open_fiscal_period' => $requiresOpenFiscalPeriod,
                'requires_chart_of_accounts' => $requiresChartOfAccounts,
                'required_node_types' => $requiredNodeTypes,
                'missing_node_types' => $missingNodeTypes,
                'integrity_issue_count' => count($relevantIssues),
                'status' => !$module->is_active ? 'inactive' : ($ready ? 'ready' : 'blocked'),
                'ready' => $ready,
                'reason_codes' => $reasons,
            ];
        });

        $activeModules = $evaluated->where('is_active', true);
        $readyModules = $activeModules->where('ready', true);
        $blockedModules = $activeModules->where('ready', false);

        return [
            'summary' => [
                'total_modules' => $modules->count(),
                'active_modules' => $activeModules->count(),
                'ready_modules' => $readyModules->count(),
                'blocked_modules' => $blockedModules->count(),
                'configuration_ready' => $activeModules->isNotEmpty() && $blockedModules->isEmpty(),
            ],
            'operating_context' => $operatingStructure,
            'accounting_readiness' => $accountingReadiness,
            'integrity' => [
                'errors' => count(array_filter($integrityIssues, fn (array $issue) => $issue['type'] === 'ERROR')),
                'warnings' => count(array_filter($integrityIssues, fn (array $issue) => $issue['type'] === 'WARNING')),
            ],
            'modules' => $evaluated->values()->all(),
        ];
    }

    /**
     * Structural checks for a configured warehouse/POS operating context.
     * This method intentionally validates organization references only; the
     * operating service continues to validate the commercial records themselves.
     */
    public function validateOperatingStructure(?OperatingContext $context, ?array $integrityIssues = null): array
    {
        $issues = $integrityIssues ?? $this->orgStructureService->runIntegrityCheck();
        $reasonCodes = [];
        $inScopeNodeUuids = [];

        if (!$context) {
            return ['ready' => false, 'reason_codes' => ['missing_operating_context'], 'node_uuids' => []];
        }

        $context->loadMissing(['warehouse', 'posTerminal', 'costCenter', 'profitCenter']);
        $anchor = $context->org_node_uuid ? StructureNode::find($context->org_node_uuid) : null;
        if (!$anchor || !$this->isActiveNode($anchor)) {
            $reasonCodes[] = 'missing_or_inactive_operating_node';
        } else {
            $inScopeNodeUuids[] = $anchor->node_uuid;
            $scope = $this->orgStructureService->resolveScopeContext($anchor->node_uuid);
            if (!isset($scope['resolved']['COMP_CODE'])) {
                $reasonCodes[] = 'operating_node_missing_company_code_path';
            }
        }

        foreach (['costCenter' => 'COST_CENTER', 'profitCenter' => 'PROFIT_CENTER'] as $relation => $expectedType) {
            $businessRecord = $context->{$relation};
            $nodeUuid = $businessRecord?->structure_node_uuid;
            $node = $nodeUuid ? StructureNode::find($nodeUuid) : null;
            if (!$node || !$this->isActiveNode($node) || $node->node_type_id !== $expectedType) {
                $reasonCodes[] = strtolower($expectedType) . '_not_structurally_linked';
                continue;
            }
            $inScopeNodeUuids[] = $node->node_uuid;
            $scope = $this->orgStructureService->resolveScopeContext($node->node_uuid);
            if (!isset($scope['resolved']['COMP_CODE'])) {
                $reasonCodes[] = strtolower($expectedType) . '_missing_company_code_path';
            }
        }

        foreach (['warehouse', 'posTerminal'] as $relation) {
            $record = $context->{$relation};
            if (!$record || !$context->org_node_uuid || $record->org_node_uuid !== $context->org_node_uuid) {
                $reasonCodes[] = $relation . '_not_attached_to_operating_node';
            }
        }

        $scopedIntegrityIssues = array_filter($issues, function (array $issue) use ($inScopeNodeUuids): bool {
            if (!in_array($issue['type'], ['ERROR', 'WARNING'], true)) {
                return false;
            }
            return in_array($issue['node_uuid'] ?? null, $inScopeNodeUuids, true);
        });
        if ($scopedIntegrityIssues !== []) {
            $reasonCodes[] = 'operating_structure_integrity_failure';
        }

        return [
            'ready' => $reasonCodes === [],
            'reason_codes' => array_values(array_unique($reasonCodes)),
            'node_uuids' => array_values(array_unique($inScopeNodeUuids)),
        ];
    }

    private function defaultContext(?int $userId): ?OperatingContext
    {
        return OperatingContext::query()
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
    }

    private function isActiveNode(StructureNode $node): bool
    {
        return $node->status === 'active'
            && (!$node->valid_from || $node->valid_from->isPast() || $node->valid_from->isToday())
            && (!$node->valid_to || $node->valid_to->isFuture() || $node->valid_to->isToday());
    }

    private function relevantIntegrityIssues(array $issues, array $requiredNodeTypes): array
    {
        if ($requiredNodeTypes === []) {
            return [];
        }

        return array_values(array_filter($issues, function (array $issue) use ($requiredNodeTypes): bool {
            if (!in_array($issue['node_type'] ?? null, $requiredNodeTypes, true)) {
                return false;
            }

            if (($issue['type'] ?? null) === 'ERROR') {
                return true;
            }

            return ($issue['type'] ?? null) === 'WARNING'
                && in_array($issue['category'] ?? null, ['missing_parent', 'inactive_with_links'], true);
        }));
    }

    private function accountingReadiness(): array
    {
        $today = now()->toDateString();
        $period = FiscalPeriod::query()
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today)
            ->orderByDesc('start_date')
            ->first();

        $periodReady = $period && !$period->is_closed && !$period->is_locked;
        $periodReason = !$period
            ? 'missing_open_fiscal_period'
            : ($period->is_closed ? 'current_fiscal_period_closed' : ($period->is_locked ? 'current_fiscal_period_locked' : null));
        $accountCount = ChartOfAccount::query()->where('is_active', true)->count();

        return [
            'ready' => (bool) $periodReady && $accountCount > 0,
            'open_fiscal_period' => [
                'ready' => (bool) $periodReady,
                'reason_code' => $periodReason,
                'period' => $period ? [
                    'id' => $period->id,
                    'name' => $period->period_name,
                    'start_date' => $period->start_date,
                    'end_date' => $period->end_date,
                    'is_closed' => (bool) $period->is_closed,
                    'is_locked' => (bool) $period->is_locked,
                ] : null,
            ],
            'chart_of_accounts' => [
                'ready' => $accountCount > 0,
                'active_account_count' => $accountCount,
            ],
        ];
    }

    private function defaultRequirements(): array
    {
        return [
            'requires_org_structure' => false,
            'required_node_types' => [],
            'requires_operating_context' => false,
            'requires_open_fiscal_period' => false,
            'requires_chart_of_accounts' => false,
        ];
    }
}
