<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;

class CreateBenefitsPlanAction
{
    public function execute(array $data, int $userId): BenefitsPlan
    {
        $data['is_active'] = true;
        $data['created_by'] = $userId;

        return BenefitsPlan::create($data);
    }
}
