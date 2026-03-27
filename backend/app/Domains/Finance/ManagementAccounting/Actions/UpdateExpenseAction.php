<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;
use App\Domains\Finance\ManagementAccounting\Models\Expense;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateExpenseAction
{
    public function execute(array $data): Expense
    {
        PermissionService::requirePermission('expenses', 'edit');

        $expense = Expense::findOrFail($data['id']);
        $oldValues = $expense->toArray();
        $expense->update($data);

        TelescopeService::logOperation('UPDATE', 'expenses', $expense->id, $oldValues, $data);

        return $expense;
    }
}
