<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\Interview;

class UpdateInterviewAction
{
    public function execute(int|string $id, array $data): Interview
    {
        $interview = Interview::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'completed' && !$interview->completed_at) {
            $data['completed_at'] = now();
        }

        $interview->update($data);
        return $interview;
    }
}
