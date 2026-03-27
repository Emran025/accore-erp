<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\Interview;

class CreateInterviewAction
{
    public function execute(array $data): Interview
    {
        $data['status'] = 'scheduled';

        return Interview::create($data)->load('applicant', 'interviewer');
    }
}
