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
            CompensationPlanResource::collection($paginated['data'] ?? $paginated)->resolve(),
            $paginated['total'] ?? (is_countable($paginated) ? count($paginated) : 0),
            $paginated['current_page'] ?? 1,
            $paginated['per_page'] ?? 15
        );
    }

    public function storePlan(StoreCompensationPlanRequest $request, CreateCompensationPlanAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($validated);
            $plan = CompensationPlan::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new CompensationPlanResource($plan))->resolve(), 'Compensation plan created', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function showPlan($id, ShowCompensationPlanAction $action): JsonResponse
    {
        $result = $action->execute($id);
        $plan = CompensationPlan::findOrFail($result['id'] ?? $id);
        return $this->successResponse((new CompensationPlanResource($plan))->resolve());
    }

    public function updatePlan(UpdateCompensationPlanRequest $request, $id, UpdateCompensationPlanAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($id, $validated);
            $plan = CompensationPlan::findOrFail($result['id'] ?? $id);
            return $this->successResponse((new CompensationPlanResource($plan))->resolve(), 'Compensation plan updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function indexEntries(Request $request, ListCompensationEntriesAction $action): JsonResponse
    {
        $filters = $request->only(['compensation_plan_id', 'employee_id', 'status']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            CompensationEntryResource::collection($paginated['data'] ?? $paginated)->resolve(),
            $paginated['total'] ?? (is_countable($paginated) ? count($paginated) : 0),
            $paginated['current_page'] ?? 1,
            $paginated['per_page'] ?? 15
        );
    }

    public function storeEntry(StoreCompensationEntryRequest $request, CreateCompensationEntryAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($validated);
            $entry = CompensationEntry::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new CompensationEntryResource($entry))->resolve(), 'Compensation entry recorded', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateEntryStatus(UpdateCompensationEntryStatusRequest $request, $id, UpdateCompensationEntryStatusAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($id, $validated);
            $entry = CompensationEntry::findOrFail($result['id'] ?? $id);
            return $this->successResponse((new CompensationEntryResource($entry))->resolve(), 'Entry status updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
