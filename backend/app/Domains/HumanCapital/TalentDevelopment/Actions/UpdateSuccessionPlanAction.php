<?php
namespace App\Domains\HumanCapital\TalentDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\SuccessionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateSuccessionPlanAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $plan = SuccessionPlan::findOrFail($this->id);
        $validated = $this->request->validate([
            'status' => 'in:active,inactive,filled',
            'readiness_level' => 'in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'notes' => 'nullable|string',
        ]);
        $plan->update($validated);
        return $this->successResponse($plan->load('incumbent', 'candidates.employee')->toArray());
    }
}
