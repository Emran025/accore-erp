<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicantResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'requisition_id'     => $this->requisition_id,
            'first_name'         => $this->when(!$this->is_anonymous, $this->first_name),
            'last_name'          => $this->when(!$this->is_anonymous, $this->last_name),
            'email'              => $this->when(!$this->is_anonymous, $this->email),
            'phone'              => $this->when(!$this->is_anonymous, $this->phone),
            'status'             => $this->status,
            'match_score'        => (int) ($this->match_score ?? 0),
            'screening_notes'    => $this->screening_notes ?? null,
            'interview_notes'    => $this->interview_notes ?? null,
            'application_date'   => $this->application_date?->toDateString(),
            'is_anonymous'       => (bool) $this->is_anonymous,
            'notes'              => $this->notes ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
