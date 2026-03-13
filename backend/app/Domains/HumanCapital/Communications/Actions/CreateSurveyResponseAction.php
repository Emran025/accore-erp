<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\PulseSurvey;
use App\Domains\HumanCapital\Communications\Models\SurveyResponse;

class CreateSurveyResponseAction
{
    public function execute(int|string $surveyId, array $data, $user): array
    {
        $survey = PulseSurvey::findOrFail($surveyId);

        $data['survey_id'] = $surveyId;
        $data['employee_id'] = $survey->is_anonymous ? null : ($user ? $user->id : null);
        $data['submitted_at'] = now();

        $response = SurveyResponse::create($data);
        return $response->toArray();
    }
}
