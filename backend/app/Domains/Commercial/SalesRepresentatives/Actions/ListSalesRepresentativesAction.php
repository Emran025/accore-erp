<?php

namespace App\Domains\Commercial\SalesRepresentatives\Actions;

use App\Domains\Commercial\Sales\Models\SalesRepresentative;
use App\Domains\Commercial\Sales\Models\SalesRepresentativeTransaction;
use Illuminate\Database\Eloquent\Builder;

class ListSalesRepresentativesAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 20)));
        $search = $filters['search'] ?? '';

        $query = SalesRepresentative::query();

        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('phone', 'like', "%$search%");
            });
        }

        $total = $query->count();
        $representatives = $query->orderBy('name')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->addSelect([
                'total_sales' => SalesRepresentativeTransaction::selectRaw('COALESCE(SUM(
                    (SELECT SUM(amount) FROM general_ledger WHERE general_ledger.voucher_number = sales_representative_transactions.voucher_number AND general_ledger.entry_type = "DEBIT")
                ), 0)')
                    ->whereColumn('sales_representative_id', 'sales_representatives.id')
                    ->where('type', 'commission')
                    ->where('is_deleted', false)
            ])
            ->get()
            ->map(function ($rep) {
                $rep->total_sales = (float) ($rep->total_sales ?? 0);
                $rep->total_paid = (float) max(0, $rep->total_sales - $rep->current_balance);
                return $rep;
            });

        return [
            'data' => $representatives,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
