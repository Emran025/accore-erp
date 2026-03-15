<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateApplicantStatusAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $applicant = JobApplicant::findOrFail($this->id);
        
        $validated = $this->request->validate([
            'status' => 'required|in:applied,screened,assessment,interview,offer,hired,rejected,withdrawn',
            'screening_notes' => 'nullable|string',
            'interview_notes' => 'nullable|string',
        ]);

        if ($this->request->status === 'screened') {
            $validated['screened_by'] = auth()->id();
        }
        
        if ($this->request->status === 'interview') {
            $validated['interviewed_by'] = auth()->id();
        }

        $applicant->update($validated);
        return $this->successResponse($applicant->load('requisition')->toArray());
    }
}
