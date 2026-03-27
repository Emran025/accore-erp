<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListRecurringTransactionsAction
{
    public function execute(array $filters): LengthAwarePaginator|RecurringTransaction
    {
        PermissionService::requirePermission('general_ledger', 'view');

        $id = $filters['id'] ?? null;
        if ($id) {
            return RecurringTransaction::findOrFail($id);
        }

        $limit = $filters['limit'] ?? 20;
        return RecurringTransaction::orderBy('name')->paginate($limit);
    }
}
