<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;

class CreateJobApplicantAction
{
    public function execute(array $data): JobApplicant
    {
        $data['application_date'] = now();
        $data['status'] = 'applied';

        return JobApplicant::create($data);
    }
}
