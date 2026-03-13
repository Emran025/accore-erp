<?php
namespace App\Domains\HumanCapital\TalentDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\SuccessionCandidate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateSuccessionCandidateAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $planId, private readonly int $candidateId) {}
    public function __invoke(): JsonResponse
    {
        $candidate = SuccessionCandidate::where('succession_plan_id', $this->planId)->findOrFail($this->candidateId);
        $validated = $this->request->validate([
            'readiness_level' => 'in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'performance_rating' => 'nullable|integer|min:1|max:5',
            'potential_rating' => 'nullable|integer|min:1|max:5',
            'development_plan' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        $candidate->update($validated);
        return $this->successResponse($candidate->load('employee')->toArray());
    }
}
