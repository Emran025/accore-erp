<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class DeleteRecurringTransactionAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('general_ledger', 'delete');

        $template = RecurringTransaction::findOrFail($id);
        $template->delete();
    }
}
