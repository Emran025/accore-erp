<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentAcquisition\Models\JobApplicant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListApplicantsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = JobApplicant::with(['requisition']);
        
        if ($this->request->filled('requisition_id')) {
            $query->where('requisition_id', $this->request->requisition_id);
        }
        
        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }
        
        return $this->successResponse($query->orderBy('application_date', 'desc')->paginate(15)->toArray());
    }
}
