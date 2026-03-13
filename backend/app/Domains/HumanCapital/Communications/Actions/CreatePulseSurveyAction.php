<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\PulseSurvey;

class CreatePulseSurveyAction
{
    public function execute(array $data, int $userId): array
    {
        $data['is_active'] = true;
        $data['created_by'] = $userId;

        $survey = PulseSurvey::create($data);
        return $survey->toArray();
    }
}
