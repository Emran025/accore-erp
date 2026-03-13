<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateGoalAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'goal_title' => 'required|string|max:255',
            'goal_description' => 'required|string',
            'goal_type' => 'required|in:okr,kpi,personal,team,corporate',
            'parent_goal_id' => 'nullable|exists:performance_goals,id',
            'target_value' => 'nullable|numeric',
            'current_value' => 'nullable|numeric',
            'unit' => 'nullable|string|max:50',
            'start_date' => 'required|date',
            'target_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'not_started';
        $validated['progress_percentage'] = 0;
        $validated['current_value'] = $validated['current_value'] ?? 0;
        $validated['created_by'] = auth()->id();

        $goal = PerformanceGoal::create($validated);
        return response()->json(array_merge(['success' => true], $goal->load('employee', 'parentGoal')->toArray()), 201);
    }
}
