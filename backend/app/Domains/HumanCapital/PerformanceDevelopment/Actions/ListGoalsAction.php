<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceGoal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListGoalsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = PerformanceGoal::with(['employee', 'parentGoal']);
        
        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }
        if ($this->request->filled('goal_type')) {
            $query->where('goal_type', $this->request->goal_type);
        }
        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }
        
        return $this->successResponse($query->orderBy('target_date', 'desc')->paginate(15)->toArray());
    }
}
