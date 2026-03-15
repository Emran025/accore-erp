<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;

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
