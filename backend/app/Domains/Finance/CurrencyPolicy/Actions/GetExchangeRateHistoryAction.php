<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\Currency\Models\CurrencyExchangeRateHistory;


class GetExchangeRateHistoryAction
{
    public function execute(array $filters): array
    {
        $query = CurrencyExchangeRateHistory::with(['currency', 'targetCurrency', 'createdBy']);

        if (isset($filters['currency_id'])) {
            $query->where('currency_id', $filters['currency_id']);
        }

        if (isset($filters['target_currency_id'])) {
            $query->where('target_currency_id', $filters['target_currency_id']);
        }

        if (isset($filters['from_date'])) {
            $query->where('effective_date', '>=', $filters['from_date']);
        }

        if (isset($filters['to_date'])) {
            $query->where('effective_date', '<=', $filters['to_date']);
        }

        return $query->orderBy('effective_date', 'desc')
            ->orderBy('effective_time', 'desc')
            ->limit($filters['limit'] ?? 100)
            ->get()
            ->toArray();
    }
}
