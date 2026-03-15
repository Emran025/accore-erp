<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class LearningEnrollmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'employee_id'      => $this->employee_id,
            'course_id'        => $this->course_id,
            'enrollment_date'  => $this->enrollment_date?->toDateString() ?? $this->enrollment_date,
            'completion_date'  => $this->completion_date?->toDateString() ?? $this->completion_date,
            'status'           => $this->status,
            'score'            => $this->score ? (float) $this->score : null,
            'notes'            => $this->notes ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'course'           => new LearningCourseResource($this->whenLoaded('course')),
        ];
    }
}
