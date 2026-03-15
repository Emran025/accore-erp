<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\Interview;

class CreateInterviewAction
{
    public function execute(array $data): array
    {
        $data['status'] = 'scheduled';

        $interview = Interview::create($data);
        return $interview->load('applicant', 'interviewer')->toArray();
    }
}
