<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListRecurringTransactionsAction
{
    public function execute(array $filters = []): LengthAwarePaginator|RecurringTransaction
    {
        $id = $filters['id'] ?? null;
        if ($id) {
            $template = RecurringTransaction::findOrFail($id);
            return $template;
        }

        $limit = $filters['limit'] ?? 20;
        $data = RecurringTransaction::orderBy('name')->paginate($limit);

        return $data;
    }
}

