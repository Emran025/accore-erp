<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UpdateCurrencyAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $id
    ) {}

    public function __invoke(): JsonResponse
    {
        $currency = Currency::findOrFail($this->id);

        $this->request->validate([
            'code' => 'required|string|max:3|unique:currencies,code,' . $this->id,
            'name' => 'required|string|max:255',
            'symbol' => 'required|string|max:10',
            'exchange_rate' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $currency->update($this->request->only(['code', 'name', 'symbol', 'exchange_rate', 'is_active']));

            if ($this->request->has('denominations')) {
                $currency->denominations()->delete();
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
