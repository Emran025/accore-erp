<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateGoalAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $goal = PerformanceGoal::findOrFail($this->id);
        
        $validated = $this->request->validate([
            'goal_title' => 'string|max:255',
            'goal_description' => 'string',
            'status' => 'in:not_started,in_progress,on_track,at_risk,completed,cancelled',
            'target_value' => 'nullable|numeric',
            'current_value' => 'nullable|numeric',
            'progress_percentage' => 'nullable|integer|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['current_value']) && isset($validated['target_value']) && $validated['target_value'] > 0) {
            $validated['progress_percentage'] = min(100, round(($validated['current_value'] / $validated['target_value']) * 100));
        }

        if ($this->request->status === 'completed' && !$goal->completed_date) {
            $validated['completed_date'] = now();
            $validated['progress_percentage'] = 100;
        }

        $goal->update($validated);
        return $this->successResponse($goal->load('employee', 'parentGoal')->toArray());
    }
}
