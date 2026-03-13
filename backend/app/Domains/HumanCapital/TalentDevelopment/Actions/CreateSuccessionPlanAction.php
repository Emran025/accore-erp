<?php
namespace App\Domains\HumanCapital\TalentDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\SuccessionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateSuccessionPlanAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'position_title' => 'required|string|max:255',
            'incumbent_id' => 'nullable|exists:employees,id',
            'readiness_level' => 'required|in:ready_now,ready_1_2_years,ready_3_5_years,not_ready',
            'notes' => 'nullable|string',
        ]);
        $validated['status'] = 'active';
        $validated['created_by'] = auth()->id();
        $plan = SuccessionPlan::create($validated);
        return response()->json(array_merge(['success' => true], $plan->load('incumbent')->toArray()), 201);
    }
}
