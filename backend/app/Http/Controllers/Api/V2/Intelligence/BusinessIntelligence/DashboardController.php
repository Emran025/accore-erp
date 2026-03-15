<?php

namespace App\Http\Controllers\Api\V2\Intelligence\BusinessIntelligence;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Intelligence\BusinessIntelligence\GetDashboardDataRequest;
use App\Http\Requests\Intelligence\BusinessIntelligence\ShowExecutiveDashboardRequest;
use App\Domains\Intelligence\BusinessIntelligence\Actions\GetDashboardDataAction;
use App\Domains\Intelligence\BusinessIntelligence\Actions\ShowExecutiveDashboardAction;

class DashboardController extends Controller
{
    use BaseApiController;

    public function index(GetDashboardDataRequest $request, GetDashboardDataAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }

    public function executive(ShowExecutiveDashboardRequest $request, ShowExecutiveDashboardAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result);
    }
}