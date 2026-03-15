<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'applicant_id'     => $this->applicant_id,
            'interview_type'   => $this->interview_type ?? null,
            'interview_date'   => $this->interview_date?->toDateTimeString() ?? $this->interview_date,
            'interviewer_id'   => $this->interviewer_id ?? null,
            'status'           => $this->status,
            'score'            => $this->score ? (float) $this->score : null,
            'feedback'         => $this->feedback ?? null,
            'notes'            => $this->notes ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
