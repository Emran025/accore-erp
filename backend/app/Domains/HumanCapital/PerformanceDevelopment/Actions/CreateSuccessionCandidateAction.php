<?php
namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionCandidate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
class CreateSuccessionCandidateAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $planId) {}
    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('employees', 'create');
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'readiness_level' => 'required|in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'potential_rating' => 'nullable|integer|min:1|max:5',
            'development_plan' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $validated['succession_plan_id'] = $this->planId;
        $candidate = SuccessionCandidate::create($validated);
        return response()->json(array_merge(['success' => true], $candidate->load('employee', 'successionPlan')->toArray()), 201);
    }
}
