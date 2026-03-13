<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;

class ListCurrenciesAction extends Action
{
    public function __invoke(): JsonResponse
    {
        $currencies = Currency::with('denominations')->get();
        return response()->json([
            'success' => true,
            'data' => $currencies,
        ]);
    }
}
