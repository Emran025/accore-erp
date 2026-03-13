<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentDevelopment;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\TalentDevelopment\Models\SuccessionPlan;
use App\Domains\HumanCapital\TalentDevelopment\Models\SuccessionCandidate;
use App\Http\Requests\HumanCapital\TalentDevelopment\StoreSuccessionPlanRequest;
use App\Http\Requests\HumanCapital\TalentDevelopment\StoreSuccessionCandidateRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class SuccessionController extends Controller
{
    use BaseApiController;

    public function index(Request $request)
    {
        $query = SuccessionPlan::with(['incumbent', 'candidates.employee']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('readiness_level')) {
            $query->where('readiness_level', $request->readiness_level);
        }

        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }

    public function store(StoreSuccessionPlanRequest $request)
    {
        $validated = $request->validated();

        $validated['status'] = 'active';
        $validated['created_by'] = auth()->id();

        $plan = SuccessionPlan::create($validated);
        return response()->json(array_merge(['success' => true], $plan->load('incumbent')->toArray()), 201);
    }

    public function show($id)
    {
        $plan = SuccessionPlan::with(['incumbent', 'candidates.employee'])->findOrFail($id);
        return $this->successResponse($plan->toArray());
    }

    public function update(Request $request, $id)
    {
        $plan = SuccessionPlan::findOrFail($id);

        $validated = $request->validate([
            'status'          => 'in:active,inactive,filled',
            'readiness_level' => 'in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'notes'           => 'nullable|string',
        ]);

        $plan->update($validated);
        return $this->successResponse($plan->load('incumbent', 'candidates.employee')->toArray());
    }

    public function storeCandidate(StoreSuccessionCandidateRequest $request, $planId)
    {
        $validated = $request->validated();

        $validated['succession_plan_id'] = $planId;

        $candidate = SuccessionCandidate::create($validated);
        return response()->json(array_merge(['success' => true], $candidate->load('employee', 'successionPlan')->toArray()), 201);
    }

    public function updateCandidate(Request $request, $planId, $candidateId)
    {
        $candidate = SuccessionCandidate::where('succession_plan_id', $planId)->findOrFail($candidateId);

        $validated = $request->validate([
            'readiness_level'    => 'in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'potential_rating'   => 'nullable|integer|min:1|max:5',
            'development_plan'   => 'nullable|string',
            'notes'              => 'nullable|string',
        ]);

        $candidate->update($validated);
        return $this->successResponse($candidate->load('employee')->toArray());
    }
}
