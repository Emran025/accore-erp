<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateApplicantAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'requisition_id' => 'required|exists:recruitment_requisitions,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'resume_path' => 'nullable|string',
            'cover_letter_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $validated['application_date'] = now();
        $validated['status'] = 'applied';

        $applicant = JobApplicant::create($validated);
        return response()->json(array_merge(['success' => true], $applicant->load('requisition')->toArray()), 201);
    }
}
