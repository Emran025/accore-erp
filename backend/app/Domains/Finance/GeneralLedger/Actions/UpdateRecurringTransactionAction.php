<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateRecurringTransactionAction
{
    public function execute(array $data): void
    {
        PermissionService::requirePermission('general_ledger', 'update');

        $template = RecurringTransaction::findOrFail($data['id']);
        $template->update($data);
    }
}
