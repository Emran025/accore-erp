<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GetCentersSummaryAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $costCenters   = CostCenter::where('is_active', true)->count();
        $profitCenters = ProfitCenter::where('is_active', true)->count();

        $totalBudget   = CostCenter::where('is_active', true)->sum('budget');
        $totalActual   = GeneralLedger::whereNotNull('cost_center_id')
                            ->where('entry_type', 'DEBIT')
                            ->sum('amount');

        $totalRevenue  = GeneralLedger::whereNotNull('profit_center_id')
                            ->where('entry_type', 'CREDIT')
                            ->sum('amount');
        $totalExpense  = GeneralLedger::whereNotNull('profit_center_id')
                            ->where('entry_type', 'DEBIT')
                            ->sum('amount');

        return [
            'cost_centers_count'   => $costCenters,
            'profit_centers_count' => $profitCenters,
            'total_budget'         => (float) $totalBudget,
            'total_actual_cost'    => (float) $totalActual,
            'budget_utilization'   => $totalBudget > 0
                ? round(($totalActual / $totalBudget) * 100, 2)
                : 0,
            'total_revenue'        => (float) $totalRevenue,
            'total_expense'        => (float) $totalExpense,
            'net_profit'           => (float) ($totalRevenue - $totalExpense),
        ];
    }
}
