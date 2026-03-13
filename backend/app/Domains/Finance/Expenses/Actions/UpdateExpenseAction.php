<?php
namespace App\Domains\Finance\Expenses\Actions;
use App\Domains\Finance\Expenses\Models\Expense;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateExpenseAction
{
    public function execute(array $data): void
    {
        PermissionService::requirePermission('expenses', 'edit');

        $expense = Expense::findOrFail($data['id']);
        $oldValues = $expense->toArray();
        $expense->update($data);

        TelescopeService::logOperation('UPDATE', 'expenses', $expense->id, $oldValues, $data);
    }
}
