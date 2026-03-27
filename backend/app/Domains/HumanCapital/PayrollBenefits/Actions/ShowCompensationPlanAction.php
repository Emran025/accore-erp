<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationPlan;

class ShowCompensationPlanAction
{
    public function execute(int|string $id): CompensationPlan
    {
        return CompensationPlan::with(['entries.employee'])->findOrFail($id);
    }
}
