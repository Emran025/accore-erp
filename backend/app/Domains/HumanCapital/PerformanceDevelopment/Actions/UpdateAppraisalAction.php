<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceAppraisal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateAppraisalAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $appraisal = PerformanceAppraisal::findOrFail($this->id);
        
        $validated = $this->request->validate([
            'status' => 'in:draft,self_review,manager_review,calibration,completed,cancelled',
            'ratings' => 'nullable|array',
            'self_assessment' => 'nullable|string',
            'manager_feedback' => 'nullable|string',
            'peer_feedback' => 'nullable|string',
            'overall_rating' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string',
        ]);

        $appraisal->update($validated);
        return $this->successResponse($appraisal->load('employee')->toArray());
    }
}
