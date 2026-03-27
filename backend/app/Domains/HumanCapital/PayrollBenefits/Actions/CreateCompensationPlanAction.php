<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\CompensationPlan;

class CreateCompensationPlanAction
{
    public function execute(array $data): CompensationPlan
    {
        $data['status'] = 'draft';
        $data['allocated_amount'] = 0;
        $data['created_by'] = auth()->id();

        return CompensationPlan::create($data);
    }
}
