<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;

class ListRecurringTransactionsAction
{
    public function execute(array $filters = []): array
    {
        $id = $filters['id'] ?? null;
        if ($id) {
            $template = RecurringTransaction::findOrFail($id);
            return $template->toArray();
        }

        $limit = $filters['limit'] ?? 20;
        $data = RecurringTransaction::orderBy('name')->paginate($limit);

        return [
            'data' => $data->items(),
            'meta' => [
                'total' => $data->total(),
                'current_page' => $data->currentPage(),
                'per_page' => $data->perPage(),
                'last_page' => $data->lastPage(),
            ],
        ];
    }
}

