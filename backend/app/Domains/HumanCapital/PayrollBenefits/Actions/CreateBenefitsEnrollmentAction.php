<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsEnrollment;

class CreateBenefitsEnrollmentAction
{
    public function execute(array $data): BenefitsEnrollment
    {
        $data['enrollment_date'] = now();
        $data['status'] = 'enrolled';

        return BenefitsEnrollment::create($data);
    }
}
