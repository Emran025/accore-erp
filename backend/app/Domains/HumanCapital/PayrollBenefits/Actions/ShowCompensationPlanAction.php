<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationPlan;

class ShowCompensationPlanAction
{
    public function execute(int|string $id): array
    {
        $plan = CompensationPlan::with(['entries.employee'])->findOrFail($id);
        return $plan->toArray();
    }
}
