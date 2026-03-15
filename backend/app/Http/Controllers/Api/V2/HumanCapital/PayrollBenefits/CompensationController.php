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
use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationPlan;
use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationEntry;
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
        $filters = $request->only(['plan_type', 'status', 'fiscal_year']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            CompensationPlanResource::collection($paginated['data']),
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storePlan(StoreCompensationPlanRequest $request, CreateCompensationPlanAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $plan = CompensationPlan::find($result['id'] ?? $result);

        return $this->successResponse(new CompensationPlanResource($plan), 'Compensation plan created', 201);
    }

    public function showPlan($id, ShowCompensationPlanAction $action): JsonResponse
    {
        $result = $action->execute($id);
        $plan = CompensationPlan::find($id);
        return $this->successResponse(new CompensationPlanResource($plan));
    }

    public function updatePlan(UpdateCompensationPlanRequest $request, $id, UpdateCompensationPlanAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $plan = CompensationPlan::find($id);

        return $this->successResponse(new CompensationPlanResource($plan), 'Compensation plan updated');
    }

    public function indexEntries(Request $request, ListCompensationEntriesAction $action): JsonResponse
    {
        $filters = $request->only(['compensation_plan_id', 'employee_id', 'status']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            CompensationEntryResource::collection($paginated['data']),
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeEntry(StoreCompensationEntryRequest $request, CreateCompensationEntryAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $entry = CompensationEntry::find($result['id'] ?? $result);

        return $this->successResponse(new CompensationEntryResource($entry), 'Compensation entry recorded', 201);
    }

    public function updateEntryStatus(UpdateCompensationEntryStatusRequest $request, $id, UpdateCompensationEntryStatusAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $entry = CompensationEntry::find($id);
        
        return $this->successResponse(new CompensationEntryResource($entry), 'Entry status updated');
    }
}
