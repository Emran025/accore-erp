<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\CompensationPlan;

class ShowCompensationPlanAction
{
    public function execute(int|string $id): array
    {
        $plan = CompensationPlan::with(['entries.employee'])->findOrFail($id);
        return $plan->toArray();
    }
}
