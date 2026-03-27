<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;

class GetBenefitsPlanAction
{
    public function execute(int $id): BenefitsPlan
    {
        return BenefitsPlan::with(['enrollments.employee'])->findOrFail($id);
    }
}
