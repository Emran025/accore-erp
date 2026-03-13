<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Models\BenefitsEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateBenefitsEnrollmentAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $enrollment = BenefitsEnrollment::findOrFail($this->id);
        $validated = $this->request->validate([
            'status' => 'in:enrolled,active,terminated,cancelled',
            'termination_date' => 'nullable|date',
            'coverage_details' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);
        $enrollment->update($validated);
        return $this->successResponse($enrollment->load('plan', 'employee')->toArray());
    }
}
