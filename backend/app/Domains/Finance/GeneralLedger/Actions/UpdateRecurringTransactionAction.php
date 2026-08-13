<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateRecurringTransactionAction
{
    public function execute(array $data, int $id): RecurringTransaction
    {
        PermissionService::requirePermission('general_ledger', 'edit');

        $template = RecurringTransaction::findOrFail($id);
        $template->update($data);

        return $template->fresh();
    }
}
