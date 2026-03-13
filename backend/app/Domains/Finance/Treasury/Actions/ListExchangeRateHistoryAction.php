<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\CurrencyExchangeRateHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListExchangeRateHistoryAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'currency_id' => 'nullable|exists:currencies,id',
            'target_currency_id' => 'nullable|exists:currencies,id',
            'from_date' => 'nullable|date',
            'to_date' => 'nullable|date|after_or_equal:from_date',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $query = CurrencyExchangeRateHistory::with(['currency', 'targetCurrency', 'createdBy']);

        if (isset($validated['currency_id'])) {
            $query->where('currency_id', $validated['currency_id']);
        }
        if (isset($validated['target_currency_id'])) {
            $query->where('target_currency_id', $validated['target_currency_id']);
        }
        if (isset($validated['from_date'])) {
            $query->where('effective_date', '>=', $validated['from_date']);
        }
        if (isset($validated['to_date'])) {
            $query->where('effective_date', '<=', $validated['to_date']);
        }

        $rates = $query->orderBy('effective_date', 'desc')
            ->orderBy('effective_time', 'desc')
            ->limit($validated['limit'] ?? 100)
            ->get();

        return response()->json(['success' => true, 'data' => $rates]);
    }
}
