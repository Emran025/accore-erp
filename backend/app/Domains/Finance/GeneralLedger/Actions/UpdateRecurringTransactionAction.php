<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateRecurringTransactionAction
{
    public function execute(array $data): void
    {
        PermissionService::requirePermission('general_ledger', 'update');

        $template = RecurringTransaction::findOrFail($data['id']);
        $template->update($data);
    }
}
