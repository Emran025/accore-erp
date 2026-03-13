<?php
namespace App\Domains\Finance\CostProfitCenters\Actions;

use App\Domains\Finance\CostProfitCenters\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ShowProfitCenterAction
{
    public function execute(int $id): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $center = ProfitCenter::with(['parent', 'revenueAccount', 'expenseAccount', 'manager', 'createdBy', 'children'])
            ->findOrFail($id);

        $center->recorder_name        = $center->createdBy->name ?? null;
        $center->parent_name          = $center->parent->name ?? null;
        $center->revenue_account_name = $center->revenueAccount->account_name ?? null;
        $center->expense_account_name = $center->expenseAccount->account_name ?? null;
        $center->manager_name         = $center->manager->name ?? null;

        $center->actual_revenue = GeneralLedger::where('profit_center_id', $center->id)
            ->where('entry_type', 'CREDIT')
            ->sum('amount');
        $center->actual_expense = GeneralLedger::where('profit_center_id', $center->id)
            ->where('entry_type', 'DEBIT')
            ->sum('amount');
        $center->net_profit = $center->actual_revenue - $center->actual_expense;

        return $center->toArray();
    }
}
