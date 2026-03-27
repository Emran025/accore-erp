<?php

namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class GenerateAgingReceivablesReportAction
{
    public function execute(array $data): Collection
    {

        $asOfDate = $data['as_of_date'] ?? now()->format('Y-m-d');

        $agingData = ArTransaction::select(
                'customers.id as customer_id',
                'customers.name as customer_name',
                DB::raw("SUM(CASE WHEN DATEDIFF(?, transaction_date) <= 0 THEN amount ELSE 0 END) as current"),
                DB::raw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 1 AND 30 THEN amount ELSE 0 END) as `1_30`"),
                DB::raw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) as `31_60`"),
                DB::raw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 61 AND 90 THEN amount ELSE 0 END) as `61_90`"),
                DB::raw("SUM(CASE WHEN DATEDIFF(?, transaction_date) > 90 THEN amount ELSE 0 END) as `over_90`"),
                DB::raw("SUM(amount) as total")
            )
            ->join('ar_customers as customers', 'customers.id', '=', 'ar_transactions.customer_id')
            ->where('ar_transactions.is_deleted', false)
            ->where('ar_transactions.type', '!=', 'payment')
            ->where('ar_transactions.transaction_date', '<=', $asOfDate)
            ->groupBy('customers.id', 'customers.name')
            ->having('total', '>', 0)
            ->setBindings([$asOfDate, $asOfDate, $asOfDate, $asOfDate, $asOfDate, $asOfDate])
            ->get();

        $totals = [
            'current' => $agingData->sum('current'),
            '1_30' => $agingData->sum('1_30'),
            '31_60' => $agingData->sum('31_60'),
            '61_90' => $agingData->sum('61_90'),
            'over_90' => $agingData->sum('over_90'),
            'total' => $agingData->sum('total'),
        ];

        return collect([
            'as_of_date' => $asOfDate,
            'data' => $agingData,
            'totals' => $totals,
        ]);
    }
}

