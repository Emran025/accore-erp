<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class LearningCourseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'course_name'   => $this->course_name,
            'description'   => $this->description ?? null,
            'course_type'   => $this->course_type ?? null,
            'provider'      => $this->provider ?? null,
            'duration_hours' => $this->duration_hours ? (float) $this->duration_hours : null,
            'is_active'     => (bool) ($this->is_active ?? true),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}
