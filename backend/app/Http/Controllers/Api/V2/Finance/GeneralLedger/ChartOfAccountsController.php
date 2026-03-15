<?php

namespace App\Http\Controllers\Api\V2\Finance\GeneralLedger;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GeneralLedger\ListChartOfAccountsRequest;
use App\Http\Requests\Finance\GeneralLedger\StoreChartOfAccountRequest;
use App\Http\Requests\Finance\GeneralLedger\UpdateChartOfAccountRequest;
use App\Http\Requests\Finance\GeneralLedger\GetChartOfAccountBalancesRequest;
use App\Domains\Finance\GeneralLedger\Actions\ListChartOfAccountsAction;
use App\Domains\Finance\GeneralLedger\Actions\CreateChartOfAccountAction;
use App\Domains\Finance\GeneralLedger\Actions\UpdateChartOfAccountAction;
use App\Domains\Finance\GeneralLedger\Actions\DeleteChartOfAccountAction;
use App\Domains\Finance\GeneralLedger\Actions\GetChartOfAccountBalancesAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ChartOfAccountsController extends Controller
{
    use BaseApiController;

    /**
     * Get all chart of accounts
     */
    public function index(ListChartOfAccountsRequest $request, ListChartOfAccountsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }

    /**
     * Create new account
     */
    public function store(StoreChartOfAccountRequest $request, CreateChartOfAccountAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Account created successfully', 201);
    }

    /**
     * Update account
     */
    public function update(UpdateChartOfAccountRequest $request, $id, UpdateChartOfAccountAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        return $this->successResponse($result, 'Account updated successfully');
    }

    /**
     * Deactivate account (soft delete)
     */
    public function destroy(int $id, DeleteChartOfAccountAction $action): JsonResponse
    {
        $result = $action->execute($id);
        return $this->successResponse($result, $result['message']);
    }

    /**
     * Get account balances summary
     */
    public function balances(GetChartOfAccountBalancesRequest $request, GetChartOfAccountBalancesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }
}
