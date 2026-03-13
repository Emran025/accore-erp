<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\Interview;

class CreateInterviewAction
{
    public function execute(array $data): array
    {
        $data['status'] = 'scheduled';

        $interview = Interview::create($data);
        return $interview->load('applicant', 'interviewer')->toArray();
    }
}
