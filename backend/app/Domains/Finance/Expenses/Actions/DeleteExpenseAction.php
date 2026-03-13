<?php
namespace App\Domains\Finance\Expenses\Actions;

use App\Domains\Finance\Expenses\Models\Expense;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class DeleteExpenseAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(int $id): void
    {
        PermissionService::requirePermission('expenses', 'delete');

        $expense = Expense::findOrFail($id);
        $oldValues = $expense->toArray();

        // Reverse GL entries if voucher exists
        if ($expense->voucher_number) {
            $this->ledgerService->reverseTransaction(
                $expense->voucher_number,
                "Reversal for deleted Expense #{$expense->id}"
            );
        }

        $expense->delete();

        TelescopeService::logOperation('DELETE', 'expenses', $id, $oldValues, null);
    }
}
