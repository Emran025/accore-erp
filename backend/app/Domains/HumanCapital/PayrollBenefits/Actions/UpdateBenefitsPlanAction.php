<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;

class UpdateBenefitsPlanAction
{
    public function execute(int $id, array $data): BenefitsPlan
    {
        $plan = BenefitsPlan::findOrFail($id);
        $plan->update($data);

        return $plan;
    }
}
