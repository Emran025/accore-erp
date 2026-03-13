<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListRecurringTransactionsAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('general_ledger', 'view');

        $id = $filters['id'] ?? null;
        if ($id) {
            $template = RecurringTransaction::findOrFail($id);
            return ['data' => $template];
        }

        $limit = $filters['limit'] ?? 20;
        $data = RecurringTransaction::orderBy('name')->paginate($limit);

        return [
            'data' => $data->items(),
            'total' => $data->total(),
        ];
    }
}
