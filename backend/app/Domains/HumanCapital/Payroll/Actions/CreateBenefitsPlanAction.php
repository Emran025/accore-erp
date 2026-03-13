<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Models\BenefitsPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateBenefitsPlanAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'plan_code' => 'required|string|max:50|unique:benefits_plans,plan_code',
            'plan_name' => 'required|string|max:255',
            'plan_type' => 'required|in:health,dental,vision,life_insurance,disability,retirement,fsa,hsa,other',
            'description' => 'nullable|string',
            'eligibility_rule' => 'required|in:all,full_time,tenure,role,custom',
            'eligibility_criteria' => 'nullable|array',
            'employee_contribution' => 'nullable|numeric|min:0',
            'employer_contribution' => 'nullable|numeric|min:0',
            'effective_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:effective_date',
        ]);
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();
        $plan = BenefitsPlan::create($validated);
        return response()->json(array_merge(['success' => true], $plan->toArray()), 201);
    }
}
