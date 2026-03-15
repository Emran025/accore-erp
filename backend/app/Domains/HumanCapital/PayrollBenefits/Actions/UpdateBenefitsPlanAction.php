<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateBenefitsPlanAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $plan = BenefitsPlan::findOrFail($this->id);
        $validated = $this->request->validate([
            'plan_name' => 'string|max:255', 'description' => 'nullable|string',
            'is_active' => 'boolean', 'expiry_date' => 'nullable|date',
        ]);
        $plan->update($validated);
        return $this->successResponse($plan->load('enrollments')->toArray());
    }
}
