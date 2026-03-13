<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\JobApplicant;

class CreateJobApplicantAction
{
    public function execute(array $data): array
    {
        $data['application_date'] = now();
        $data['status'] = 'applied';

        $applicant = JobApplicant::create($data);
        return current($applicant->toArray()) ?: reset($applicant);
    }
}
