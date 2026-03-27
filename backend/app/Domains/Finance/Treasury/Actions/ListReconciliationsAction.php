<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\Treasury\Models\Reconciliation;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListReconciliationsAction
{
    public function __construct(protected LedgerService $ledgerService) {}

    public function execute(array $filters): LengthAwarePaginator
    {
        $query = Reconciliation::with(['bankAccount']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $limit = $filters['limit'] ?? $filters['per_page'] ?? 15;

        return $query->orderBy('reconciliation_date', 'desc')
            ->paginate($limit);
    }
}
