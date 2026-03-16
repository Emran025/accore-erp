<?php

namespace App\Http\Controllers\Api\V2\Finance\ForeignExchange;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ForeignExchange\StoreCurrencyRequest;
use App\Http\Requests\Finance\ForeignExchange\UpdateCurrencyRequest;
use App\Http\Requests\Finance\ForeignExchange\CurrencyIdRequest;
use App\Domains\Finance\ForeignExchange\Actions\ListCurrenciesAction;
use App\Domains\Finance\ForeignExchange\Actions\CreateCurrencyAction;
use App\Domains\Finance\ForeignExchange\Actions\UpdateCurrencyAction;
use App\Domains\Finance\ForeignExchange\Actions\DeleteCurrencyAction;
use App\Domains\Finance\ForeignExchange\Actions\ToggleCurrencyStatusAction;
use App\Domains\Finance\ForeignExchange\Actions\SetPrimaryCurrencyAction;
use App\Domains\Finance\ForeignExchange\Models\Currency;
use App\Http\Resources\Finance\ForeignExchange\CurrencyResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CurrencyController extends Controller
{
    use BaseApiController;

    /**
     * List all currencies
     */
    public function index(ListCurrenciesAction $action): JsonResponse
    {
        $currencies = $action->execute();
        return $this->successResponse(CurrencyResource::collection($currencies));
    }

    /**
     * Create a new currency
     */
    public function store(StoreCurrencyRequest $request, CreateCurrencyAction $action): JsonResponse
    {
        try {
            $currency = $action->execute($request->validated());
            return $this->successResponse(new CurrencyResource($currency), 'Currency created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Update a currency
     */
    public function update(UpdateCurrencyRequest $request, int $id, UpdateCurrencyAction $action): JsonResponse
    {
        try {
            $currency = $action->execute($request->validated(), $id);
            return $this->successResponse(new CurrencyResource($currency), 'Currency updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Delete a currency
     */
    public function destroy(int $id, DeleteCurrencyAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Currency deleted');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id, ToggleCurrencyStatusAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            $currency = Currency::findOrFail($id);
            return $this->successResponse(new CurrencyResource($currency), 'Currency status toggled');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Set a currency as primary
     */
    public function setPrimary(int $id, SetPrimaryCurrencyAction $action): JsonResponse
    {
        try {
            $result = $action->execute($id);
            $currency = Currency::find($id);
            return $this->successResponse(new CurrencyResource($currency), $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
