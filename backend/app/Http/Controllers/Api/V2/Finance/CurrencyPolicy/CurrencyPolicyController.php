<?php

namespace App\Http\Controllers\Api\V2\Finance\CurrencyPolicy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\CurrencyPolicy\StoreCurrencyPolicyRequest;
use App\Http\Requests\Finance\CurrencyPolicy\UpdateCurrencyPolicyRequest;
use App\Http\Requests\Finance\CurrencyPolicy\RecordExchangeRateRequest;
use App\Http\Requests\Finance\CurrencyPolicy\ConvertAmountRequest;
use App\Http\Requests\Finance\CurrencyPolicy\ProcessRevaluationRequest;
use App\Domains\Finance\CurrencyPolicy\Actions\ListCurrencyPoliciesAction;
use App\Domains\Finance\CurrencyPolicy\Actions\GetActiveCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\CreateCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\ShowCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\UpdateCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\ActivateCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\DeleteCurrencyPolicyAction;
use App\Domains\Finance\CurrencyPolicy\Actions\GetExchangeRateHistoryAction;
use App\Domains\Finance\CurrencyPolicy\Actions\RecordExchangeRateAction;
use App\Domains\Finance\CurrencyPolicy\Actions\GetExchangeRateAction;
use App\Domains\Finance\CurrencyPolicy\Actions\ConvertAmountAction;
use App\Domains\Finance\CurrencyPolicy\Actions\ProcessRevaluationAction;
use App\Domains\Finance\CurrencyPolicy\Actions\GetCurrencyPolicyTypesAction;
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
        return $this->successResponse($action->execute());
    }

    /**
     * Get the currently active policy with status
     */
    public function getActivePolicy(GetActiveCurrencyPolicyAction $action): JsonResponse
    {
        return $this->successResponse($action->execute());
    }

    /**
     * Create a new currency policy
     */
    public function store(StoreCurrencyPolicyRequest $request, CreateCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($request->validated());
            return $this->successResponse($policy, 'Currency policy created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get a specific currency policy
     */
    public function show(int $id, ShowCurrencyPolicyAction $action): JsonResponse
    {
        return $this->successResponse($action->execute($id));
    }

    /**
     * Update a currency policy
     */
    public function update(UpdateCurrencyPolicyRequest $request, int $id, UpdateCurrencyPolicyAction $action): JsonResponse
    {
        try {
            $policy = $action->execute($request->validated(), $id);
            return $this->successResponse($policy, 'Currency policy updated successfully');
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
            $result = $action->execute($id);
            return $this->successResponse($result['data'], $result['message']);
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
        return $this->successResponse($action->execute($request->all()));
    }

    /**
     * Record a new exchange rate
     */
    public function recordExchangeRate(RecordExchangeRateRequest $request, RecordExchangeRateAction $action): JsonResponse
    {
        try {
            $rate = $action->execute($request->validated());
            return $this->successResponse($rate, 'Exchange rate recorded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get current exchange rate for a currency pair
     */
    public function getExchangeRate(Request $request, GetExchangeRateAction $action): JsonResponse
    {
        $rate = $action->execute($request->all());

        if ($rate === null) {
            return $this->errorResponse('No exchange rate available for this currency pair', 404);
        }

        return $this->successResponse($rate);
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
