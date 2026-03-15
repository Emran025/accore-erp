<?php
namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;

class GetAgingReportAction
{
    public function execute(array $data): array
    {

        $type = $data['type'] ?? 'receivables'; // receivables or payables
        $date = $data['as_of_date'] ?? now()->format('Y-m-d');

        if ($type === 'receivables') {
            $reportData = $this->getReceivablesAging($date);
        } else {
            $reportData = $this->getPayablesAging($date);
        }

        return [
            'as_of_date' => $date,
            'type' => $type,
            'data' => $reportData,
        ];
    }

    private function getReceivablesAging(string $date)
    {
        return ArTransaction::select('c.name')
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) <= 30 THEN amount ELSE 0 END) as '0_30'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) as '31_60'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) > 60 THEN amount ELSE 0 END) as 'over_60'")
            ->join('ar_customers as c', 'c.id', '=', 'ar_transactions.customer_id')
            ->whereDate('transaction_date', '<=', $date)
            ->groupBy('c.name')
            ->setBindings([$date, $date, $date])
            ->get();
    }

    private function getPayablesAging(string $date)
    {
        return ApTransaction::select('s.name')
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) <= 30 THEN amount ELSE 0 END) as '0_30'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) BETWEEN 31 AND 60 THEN amount ELSE 0 END) as '31_60'")
            ->selectRaw("SUM(CASE WHEN DATEDIFF(?, transaction_date) > 60 THEN amount ELSE 0 END) as 'over_60'")
            ->join('ap_suppliers as s', 's.id', '=', 'ap_transactions.supplier_id')
            ->whereDate('transaction_date', '<=', $date)
            ->groupBy('s.name')
            ->setBindings([$date, $date, $date])
            ->get();
    }
}
