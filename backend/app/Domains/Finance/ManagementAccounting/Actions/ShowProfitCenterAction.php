<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ShowProfitCenterAction
{
    public function execute(int $id): ProfitCenter
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $center = ProfitCenter::with(['parent', 'revenueAccount', 'expenseAccount', 'manager', 'createdBy', 'children'])
            ->findOrFail($id);

        $center->actual_revenue = GeneralLedger::where('profit_center_id', $center->id)
            ->where('entry_type', 'CREDIT')
            ->sum('amount');
        $center->actual_expense = GeneralLedger::where('profit_center_id', $center->id)
            ->where('entry_type', 'DEBIT')
            ->sum('amount');
        $center->net_profit = $center->actual_revenue - $center->actual_expense;

        return $center;
    }
}
