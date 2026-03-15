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
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\Finance\ForeignExchange\CurrencyResource;

class CurrencyController extends Controller
{
    use BaseApiController;

    /**
     * List all currencies
     */
    public function index(ListCurrenciesAction $action): JsonResponse
    {
        return $this->successResponse(CurrencyResource::collection($action->execute()));
    }

    /**
     * Create a new currency
     */
    public function store(StoreCurrencyRequest $request, CreateCurrencyAction $action): JsonResponse
    {
        try {
            return $this->successResponse(new CurrencyResource($action->execute($request->validated())));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Update a currency
     */
    public function update(UpdateCurrencyRequest $request, int $id, UpdateCurrencyAction $action): JsonResponse
    {
        try {
            return $this->successResponse(new CurrencyResource($action->execute($request->validated(), $id)));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
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
            return $this->successResponse($action->execute($id));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Set a currency as primary
     */
    public function setPrimary(int $id, SetPrimaryCurrencyAction $action): JsonResponse
    {
        try {
            $result = $action->execute($id);
            return $this->successResponse($result['data'], $result['message']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
