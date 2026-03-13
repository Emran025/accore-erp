<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;

class DeleteCurrencyAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $currency = Currency::findOrFail($this->id);
        if ($currency->is_primary) {
            return response()->json(['success' => false, 'message' => 'Cannot delete primary currency'], 400);
        }
        $currency->delete();
        return response()->json(['success' => true, 'message' => 'Currency deleted']);
    }
}
