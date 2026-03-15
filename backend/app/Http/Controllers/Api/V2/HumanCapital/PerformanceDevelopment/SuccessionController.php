<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PerformanceDevelopment;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionCandidate;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StoreSuccessionPlanRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdateSuccessionPlanRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StoreSuccessionCandidateRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdateSuccessionCandidateRequest;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\SuccessionPlanResource;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\SuccessionCandidateResource;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\{
    ListSuccessionPlansAction,
    CreateSuccessionPlanAction,
    UpdateSuccessionPlanAction,
    ShowSuccessionPlanAction,
    CreateSuccessionCandidateAction,
    UpdateSuccessionCandidateAction
};
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class SuccessionController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListSuccessionPlansAction $action)
    {
        $paginated = $action->execute($request->all());

        return $this->paginatedResponse(
            SuccessionPlanResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function store(StoreSuccessionPlanRequest $request, CreateSuccessionPlanAction $action)
    {
        $plan = $action->execute($request->validated());
        return $this->successResponse(new SuccessionPlanResource($plan->load('incumbent')), 'Succession plan created successfully', 201);
    }

    public function show($id, ShowSuccessionPlanAction $action)
    {
        $plan = $action->execute($id);
        return $this->successResponse(new SuccessionPlanResource($plan));
    }

    public function update(UpdateSuccessionPlanRequest $request, $id, UpdateSuccessionPlanAction $action)
    {
        $plan = SuccessionPlan::findOrFail($id);
        $updatedPlan = $action->execute($plan, $request->validated());
        return $this->successResponse(new SuccessionPlanResource($updatedPlan->load('incumbent', 'candidates.employee')), 'Succession plan updated successfully');
    }

    public function storeCandidate(StoreSuccessionCandidateRequest $request, $planId, CreateSuccessionCandidateAction $action)
    {
        $data = $request->validated();
        $data['succession_plan_id'] = $planId;

        $candidate = $action->execute($data);
        return $this->successResponse(new SuccessionCandidateResource($candidate->load('employee', 'successionPlan')), 'Candidate added successfully', 201);
    }

    public function updateCandidate(UpdateSuccessionCandidateRequest $request, $planId, $candidateId, UpdateSuccessionCandidateAction $action)
    {
        $candidate = SuccessionCandidate::where('succession_plan_id', $planId)->findOrFail($candidateId);
        $updatedCandidate = $action->execute($candidate, $request->validated());
        return $this->successResponse(new SuccessionCandidateResource($updatedCandidate->load('employee')), 'Candidate updated successfully');
    }
}
