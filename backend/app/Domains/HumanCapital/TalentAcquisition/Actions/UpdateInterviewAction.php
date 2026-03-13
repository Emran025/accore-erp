<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\Interview;

class UpdateInterviewAction
{
    public function execute(int|string $id, array $data): array
    {
        $interview = Interview::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'completed' && !$interview->completed_at) {
            $data['completed_at'] = now();
        }

        $interview->update($data);
        return current($interview->toArray()) ?: reset($interview);
    }
}
