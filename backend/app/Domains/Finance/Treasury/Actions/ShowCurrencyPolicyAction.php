<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use Illuminate\Http\JsonResponse;

class ShowCurrencyPolicyAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $policy = CurrencyPolicy::findOrFail($this->id);
        return response()->json(['success' => true, 'data' => $policy]);
    }
}
