<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreateCurrencyAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'code' => 'required|string|max:3|unique:currencies,code',
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $currency = Currency::create($this->request->only(['code', 'name', 'symbol', 'exchange_rate', 'is_active']));

            if ($this->request->has('denominations')) {
                foreach ($this->request->denominations as $denom) {
                    $currency->denominations()->create($denom);
                }
            }

            DB::commit();
            return response()->json(['success' => true, 'data' => $currency->load('denominations')]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
