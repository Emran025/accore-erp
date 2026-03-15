<?php

namespace App\Http\Resources\HumanCapital\HRCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpertiseDirectoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'employee_id'    => $this->employee_id,
            'skills'         => $this->skills,
            'certifications' => $this->certifications,
            'experience'     => $this->experience,
            'languages'      => $this->languages,
            'biography'      => $this->biography,
            'status'         => $this->status,
            'employee'       => $this->whenLoaded('employee'),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
