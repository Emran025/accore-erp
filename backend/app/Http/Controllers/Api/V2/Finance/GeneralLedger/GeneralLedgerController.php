<?php

namespace App\Http\Controllers\Api\V2\Finance\GeneralLedger;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GeneralLedger\TrialBalanceRequest;
use App\Http\Requests\Finance\GeneralLedger\AccountDetailsRequest;
use App\Http\Requests\Finance\GeneralLedger\ListGlEntriesRequest;
use App\Http\Requests\Finance\GeneralLedger\AccountActivityRequest;
use App\Http\Requests\Finance\GeneralLedger\AccountBalanceHistoryRequest;
use App\Domains\Finance\GeneralLedger\Actions\GetTrialBalanceAction;
use App\Domains\Finance\GeneralLedger\Actions\GetAccountDetailsAction;
use App\Domains\Finance\GeneralLedger\Actions\ListGlEntriesAction;
use App\Domains\Finance\GeneralLedger\Actions\GetAccountActivityAction;
use App\Domains\Finance\GeneralLedger\Actions\GetAccountBalanceHistoryAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

/**
 * Controller for General Ledger operations via API.
 * Provides endpoints for trial balance, account details, GL entries,
 * account activity analysis, and balance history reporting.
 */
class GeneralLedgerController extends Controller
{
    use BaseApiController;

    /**
     * Get trial balance report.
     */
    public function trialBalance(TrialBalanceRequest $request, GetTrialBalanceAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get account details with paginated transaction history.
     */
    public function accountDetails(AccountDetailsRequest $request, GetAccountDetailsAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get GL entries with flexible filtering.
     */
    public function entries(ListGlEntriesRequest $request, ListGlEntriesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }

    /**
     * Get account activity summary for a period.
     */
    public function accountActivity(AccountActivityRequest $request, GetAccountActivityAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }

    /**
     * Get account balance history over time.
     */
    public function accountBalanceHistory(AccountBalanceHistoryRequest $request, GetAccountBalanceHistoryAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
