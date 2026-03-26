<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsEnrollment;

class UpdateBenefitsEnrollmentAction
{
    public function execute(int $id, array $data): BenefitsEnrollment
    {
        $enrollment = BenefitsEnrollment::findOrFail($id);
        $enrollment->update($data);

        return $enrollment;
    }
}
