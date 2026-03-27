<?php

namespace App\Domains\Commercial\MarketingDistribution\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentative;
use App\Domains\Commercial\SalesLifecycle\Models\SalesRepresentativeTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Collection;

class GetSalesRepresentativeLedgerAction
{
    public function execute(array $filters): Collection
    {
        $representativeId = $filters['sales_representative_id'];
        $representative = SalesRepresentative::findOrFail($representativeId);
        
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 20)));

        $query = SalesRepresentativeTransaction::where('sales_representative_id', $representativeId);

        if ($filters['show_deleted'] ?? false) {
             $query->where('is_deleted', true);
        } else {
             $query->where('is_deleted', false);
        }

        $query->addSelect([
            'sales_representative_transactions.*',
            'amount' => GeneralLedger::selectRaw('SUM(amount)')
                ->whereColumn('voucher_number', 'sales_representative_transactions.voucher_number')
                ->where('entry_type', 'DEBIT')
                ->limit(1)
        ]);

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%$search%")
                  ->orWhere('reference_id', 'like', "%$search%");
            });
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('type', $type);
        }

        if ($dateFrom = ($filters['date_from'] ?? null)) {
            $query->whereDate('transaction_date', '>=', $dateFrom);
        }

        if ($dateTo = ($filters['date_to'] ?? null)) {
            $query->whereDate('transaction_date', '<=', $dateTo);
        }

        $statsQuery = DB::table(
            DB::raw("({$query->toSql()}) as trans")
        )->mergeBindings($query->getQuery());

        $statsData = $statsQuery->selectRaw('
            SUM(CASE WHEN type = "commission" THEN amount ELSE 0 END) as total_commissions,
            SUM(CASE WHEN type IN ("payment", "return") THEN amount ELSE 0 END) as total_payments,
            SUM(CASE WHEN type = "return" THEN amount ELSE 0 END) as total_returns,
            COUNT(*) as transaction_count
        ')->first();

        $paginator = $query->with('createdBy')
            ->orderBy('transaction_date', 'desc')
            ->paginate($perPage);

        return collect([
            'representative' => [
                'id' => $representative->id,
                'name' => $representative->name,
                'current_balance' => (float)$representative->current_balance,
            ],
            'transactions' => $paginator,
            'stats' => [
                'total_commissions' => (float)($statsData->total_commissions ?? 0),
                'total_payments' => (float)($statsData->total_payments ?? 0),
                'total_returns' => (float)($statsData->total_returns ?? 0),
                'balance' => (float)$representative->current_balance,
                'transaction_count' => (int)($statsData->transaction_count ?? 0),
            ]
        ]);
    }
}
