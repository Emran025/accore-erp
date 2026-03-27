<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;
use App\Domains\HumanCapital\HRCompliance\Models\SurveyResponse;

class CreateSurveyResponseAction
{
    public function execute(int|string $surveyId, array $data, $user): SurveyResponse
    {
        $survey = PulseSurvey::findOrFail($surveyId);

        $data['survey_id'] = $surveyId;
        $data['employee_id'] = $survey->is_anonymous ? null : ($user ? $user->id : null);
        $data['submitted_at'] = now();

        return SurveyResponse::create($data);
    }
}
