<?php

namespace App\Http\Resources\HumanCapital\HRCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class SurveyResponseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'pulse_survey_id' => $this->pulse_survey_id,
            'employee_id'     => $this->employee_id,
            'responses'       => $this->responses, // array of answers
            'comments'        => $this->comments,
            'submitted_at'    => $this->created_at?->toDateTimeString(),
            'employee'        => $this->whenLoaded('employee'),
            'survey'          => $this->whenLoaded('survey'),
        ];
    }
}
