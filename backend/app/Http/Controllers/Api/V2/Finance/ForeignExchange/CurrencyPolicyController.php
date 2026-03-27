<?php

namespace App\Http\Controllers\Api\V2\Finance\ForeignExchange;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ForeignExchange\StoreCurrencyPolicyRequest;
use App\Http\Requests\Finance\ForeignExchange\UpdateCurrencyPolicyRequest;
use App\Http\Requests\Finance\ForeignExchange\RecordExchangeRateRequest;
use App\Http\Requests\Finance\ForeignExchange\ConvertAmountRequest;
use App\Http\Requests\Finance\ForeignExchange\ProcessRevaluationRequest;
use App\Domains\Finance\ForeignExchange\Actions\ListCurrencyPoliciesAction;
use App\Domains\Finance\ForeignExchange\Actions\GetActiveCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\CreateCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\ShowCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\UpdateCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\ActivateCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\DeleteCurrencyPolicyAction;
use App\Domains\Finance\ForeignExchange\Actions\GetExchangeRateHistoryAction;
use App\Domains\Finance\ForeignExchange\Actions\RecordExchangeRateAction;
use App\Domains\Finance\ForeignExchange\Actions\GetExchangeRateAction;
use App\Domains\Finance\ForeignExchange\Actions\ConvertAmountAction;
use App\Domains\Finance\ForeignExchange\Actions\ProcessRevaluationAction;
use App\Domains\Finance\ForeignExchange\Actions\GetCurrencyPolicyTypesAction;
use App\Http\Resources\Finance\ForeignExchange\CurrencyPolicyResource;
use App\Http\Resources\Finance\ForeignExchange\CurrencyExchangeRateHistoryResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CurrencyPolicyController extends Controller
{
    use BaseApiController;

    /**
     * Get all currency policies
     */
    public function index(ListCurrencyPoliciesAction $action): JsonResponse
    {
        $policies = $action->execute();
        return $this->successResponse(CurrencyPolicyResource::collection($policies));
    }

    /**
     * Get the currently active policy with status
     */
    public function getActivePolicy(GetActiveCurrencyPolicyAction $action): JsonResponse
    {
        $policy = $action->execute();
        return $this->successResponse($policy ? new CurrencyPolicyResource($policy) : null);
    }

    /**
     * Create a new currency policy
     */
    public function store(StoreCurrencyPolicyRequest $request, CreateCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($request->validated());
            return $this->successResponse(new CurrencyPolicyResource($policy), 'Currency policy created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get a specific currency policy
     */
    public function show(int $id, ShowCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($id);
            return $this->successResponse(new CurrencyPolicyResource($policy));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Update a currency policy
     */
    public function update(UpdateCurrencyPolicyRequest $request, int $id, UpdateCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($request->validated(), $id);
            return $this->successResponse(new CurrencyPolicyResource($policy), 'Currency policy updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Activate a currency policy
     */
    public function activate(int $id, ActivateCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($id);
            return $this->successResponse(new CurrencyPolicyResource($policy), 'Currency policy activated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete a currency policy
     */
    public function destroy(int $id, DeleteCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Currency policy deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get exchange rate history
     */
    public function getExchangeRateHistory(Request $request, GetExchangeRateHistoryAction $action): JsonResponse
    {
        $history = $action->execute($request->all());
        return $this->successResponse(CurrencyExchangeRateHistoryResource::collection($history));
    }

    /**
     * Record a new exchange rate
     */
    public function recordExchangeRate(RecordExchangeRateRequest $request, RecordExchangeRateAction $action): JsonResponse
    {
        try {
            $rate = $action->execute($request->validated());
            return $this->successResponse(new CurrencyExchangeRateHistoryResource($rate), 'Exchange rate recorded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get current exchange rate for a currency pair
     */
    public function getExchangeRate(Request $request, GetExchangeRateAction $action): JsonResponse
    {
        try {
            $rate = $action->execute($request->all());
            if (!$rate) {
                return $this->errorResponse('No exchange rate available for this currency pair', 404);
            }
            return $this->successResponse(new CurrencyExchangeRateHistoryResource($rate));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Convert an amount
     */
    public function convert(ConvertAmountRequest $request, ConvertAmountAction $action): JsonResponse
    {
        try {
            return $this->successResponse($action->execute($request->validated()));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Process revaluation for a currency
     */
    public function processRevaluation(ProcessRevaluationRequest $request, ProcessRevaluationAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result, 'Revaluation processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get available policy types for dropdown
     */
    public function getPolicyTypes(GetCurrencyPolicyTypesAction $action): JsonResponse
    {
        return $this->successResponse($action->execute());
    }
}
