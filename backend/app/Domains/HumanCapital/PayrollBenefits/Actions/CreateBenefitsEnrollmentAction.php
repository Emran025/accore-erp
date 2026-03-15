<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateBenefitsEnrollmentAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'plan_id' => 'required|exists:benefits_plans,id',
            'employee_id' => 'required|exists:employees,id',
            'enrollment_type' => 'required|in:open_enrollment,new_hire,life_event,qualifying_event',
            'effective_date' => 'required|date',
            'coverage_details' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);
        $validated['enrollment_date'] = now();
        $validated['status'] = 'enrolled';
        $enrollment = BenefitsEnrollment::create($validated);
        return response()->json(array_merge(['success' => true], $enrollment->load('plan', 'employee')->toArray()), 201);
    }
}
