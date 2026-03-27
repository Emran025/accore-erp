<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ShowCostCenterAction
{
    public function execute(int $id): CostCenter
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');

        $center = CostCenter::with(['parent', 'account', 'manager', 'createdBy', 'children'])
            ->findOrFail($id);

        $center->actual_cost = GeneralLedger::where('cost_center_id', $center->id)
            ->where('entry_type', 'DEBIT')
            ->sum('amount');
        $center->budget_utilization = $center->budget > 0
            ? round(($center->actual_cost / $center->budget) * 100, 2)
            : 0;

        return $center;
    }
}
