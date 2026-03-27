<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;

class CreatePulseSurveyAction
{
    public function execute(array $data, int $userId): PulseSurvey
    {
        $data['is_active'] = true;
        $data['created_by'] = $userId;

        return PulseSurvey::create($data);
    }
}
