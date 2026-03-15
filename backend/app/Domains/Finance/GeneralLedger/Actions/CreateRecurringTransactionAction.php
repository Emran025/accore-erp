<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateRecurringTransactionAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('general_ledger', 'create');

        $template = RecurringTransaction::create($data);

        return ['id' => $template->id];
    }
}
