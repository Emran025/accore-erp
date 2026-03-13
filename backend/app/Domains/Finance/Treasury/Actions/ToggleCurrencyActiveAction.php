<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;

class ToggleCurrencyActiveAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $currency = Currency::findOrFail($this->id);
        if ($currency->is_primary && $currency->is_active) {
            return response()->json(['success' => false, 'message' => 'Cannot deactivate primary currency'], 400);
        }
        $currency->is_active = !$currency->is_active;
        $currency->save();
        return response()->json(['success' => true, 'data' => $currency]);
    }
}
