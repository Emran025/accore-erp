<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;

class ContinuousFeedbackResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'employee_id'    => $this->employee_id,
            'feedback_by'    => $this->feedback_by,
            'feedback_text'  => $this->feedback_text,
            'feedback_type'  => $this->feedback_type,
            'feedback_date'  => $this->feedback_date,
            'tags'           => $this->tags,
            'employee'       => new EmployeeResource($this->whenLoaded('employee')),
            'provider'       => new EmployeeResource($this->whenLoaded('provider')),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
