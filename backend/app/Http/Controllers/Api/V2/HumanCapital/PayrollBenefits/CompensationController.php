<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\PayrollBenefits\StoreCompensationPlanRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdateCompensationPlanRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\StoreCompensationEntryRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdateCompensationEntryStatusRequest;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListCompensationPlansAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ShowCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListCompensationEntriesAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateCompensationEntryAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateCompensationEntryStatusAction;
use App\Http\Resources\HumanCapital\PayrollBenefits\CompensationPlanResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\CompensationEntryResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class CompensationController extends Controller
{
    use BaseApiController;

    public function indexPlans(Request $request, ListCompensationPlansAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(CompensationPlanResource::collection($paginator));
    }

    public function storePlan(StoreCompensationPlanRequest $request, CreateCompensationPlanAction $action): JsonResponse
    {
        try {
            $plan = $action->execute($request->validated());
            return $this->successResponse(new CompensationPlanResource($plan), 'Compensation plan created', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function showPlan($id, ShowCompensationPlanAction $action): JsonResponse
    {
        $plan = $action->execute($id);
        return $this->successResponse(new CompensationPlanResource($plan));
    }

    public function updatePlan(UpdateCompensationPlanRequest $request, $id, UpdateCompensationPlanAction $action): JsonResponse
    {
        try {
            $plan = $action->execute($id, $request->validated());
            return $this->successResponse(new CompensationPlanResource($plan), 'Compensation plan updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function indexEntries(Request $request, ListCompensationEntriesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(CompensationEntryResource::collection($paginator));
    }

    public function storeEntry(StoreCompensationEntryRequest $request, CreateCompensationEntryAction $action): JsonResponse
    {
        try {
            $entry = $action->execute($request->validated());
            return $this->successResponse(new CompensationEntryResource($entry), 'Compensation entry recorded', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateEntryStatus(UpdateCompensationEntryStatusRequest $request, $id, UpdateCompensationEntryStatusAction $action): JsonResponse
    {
        try {
            $entry = $action->execute($id, $request->validated());
            return $this->successResponse(new CompensationEntryResource($entry), 'Entry status updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
