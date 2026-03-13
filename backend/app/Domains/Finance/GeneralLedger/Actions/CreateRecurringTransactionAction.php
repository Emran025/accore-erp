<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class CreateRecurringTransactionAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('general_ledger', 'create');

        $template = RecurringTransaction::create($data);

        return ['id' => $template->id];
    }
}
