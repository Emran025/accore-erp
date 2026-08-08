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
use App\Http\Resources\Finance\GeneralLedger\ChartOfAccountResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ChartOfAccountsController extends Controller
{
    use BaseApiController;

    public function index(ListChartOfAccountsRequest $request, ListChartOfAccountsAction $action): JsonResponse
    {
        $accounts = $action->execute($request->validated());
        return $this->successResponse(ChartOfAccountResource::collection($accounts)->resolve());
    }

    public function store(StoreChartOfAccountRequest $request, CreateChartOfAccountAction $action): JsonResponse
    {
        $account = $action->execute($request->validated());
        return $this->successResponse(new ChartOfAccountResource($account), 'Account created successfully');
    }

    public function update(UpdateChartOfAccountRequest $request, int $id, UpdateChartOfAccountAction $action): JsonResponse
    {
        $account = $action->execute($id, $request->validated());
        return $this->successResponse(new ChartOfAccountResource($account), 'Account updated successfully');
    }

    public function destroy(int $id, DeleteChartOfAccountAction $action): JsonResponse
    {
        $result = $action->execute($id);
        return $this->successResponse([], $result['message']);
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
