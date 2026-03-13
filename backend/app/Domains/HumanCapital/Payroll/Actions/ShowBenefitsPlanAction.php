<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Models\BenefitsPlan;
use Illuminate\Http\JsonResponse;

class ShowBenefitsPlanAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $plan = BenefitsPlan::with(['enrollments.employee'])->findOrFail($this->id);
        return $this->successResponse($plan->toArray());
    }
}
