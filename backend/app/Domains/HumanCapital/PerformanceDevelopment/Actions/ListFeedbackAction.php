<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\ContinuousFeedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListFeedbackAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = ContinuousFeedback::with(['employee', 'givenBy']);
        
        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }
        if ($this->request->filled('feedback_type')) {
            $query->where('feedback_type', $this->request->feedback_type);
        }
        
        return $this->successResponse($query->orderBy('feedback_date', 'desc')->paginate(15)->toArray());
    }
}
