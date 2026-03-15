<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\Treasury\Models\Reconciliation;

class ListReconciliationsAction
{
    public function execute(array $filters): array
    {
        $query = Reconciliation::with(['bankAccount']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $limit = $filters['limit'] ?? $filters['per_page'] ?? 15;

        return $query->orderBy('reconciliation_date', 'desc')
            ->paginate($limit)
            ->toArray();
    }
}

