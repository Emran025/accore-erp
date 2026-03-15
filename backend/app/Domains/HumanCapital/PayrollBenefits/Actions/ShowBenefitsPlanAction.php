<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;
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
