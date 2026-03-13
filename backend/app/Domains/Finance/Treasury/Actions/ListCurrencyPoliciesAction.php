<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;

class ListCurrencyPoliciesAction extends Action
{
    public function __invoke(): JsonResponse
    {
        $policies = CurrencyPolicy::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $policies]);
    }
}
