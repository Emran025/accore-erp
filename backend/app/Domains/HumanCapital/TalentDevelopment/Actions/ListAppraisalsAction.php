<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceAppraisal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListAppraisalsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = PerformanceAppraisal::with(['employee']);
        
        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }
        if ($this->request->filled('appraisal_type')) {
            $query->where('appraisal_type', $this->request->appraisal_type);
        }
        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }
        
        return $this->successResponse($query->orderBy('appraisal_date', 'desc')->paginate(15)->toArray());
    }
}
