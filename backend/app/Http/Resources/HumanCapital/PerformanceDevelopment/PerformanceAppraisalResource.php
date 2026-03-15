<?php

namespace App\Http\Resources\HumanCapital\PerformanceDevelopment;

use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceAppraisalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'appraisal_number'   => $this->appraisal_number,
            'employee_id'        => $this->employee_id,
            'appraisal_type'     => $this->appraisal_type,
            'appraisal_period'   => $this->appraisal_period,
            'appraisal_date'     => $this->appraisal_date?->toDateString(),
            'status'             => $this->status,
            'ratings'            => $this->ratings,
            'self_assessment'    => $this->self_assessment ?? null,
            'manager_feedback'   => $this->manager_feedback ?? null,
            'peer_feedback'      => $this->peer_feedback ?? null,
            'overall_rating'     => (float) ($this->overall_rating ?? 0),
            'manager_id'         => $this->manager_id,
            'reviewed_by'        => $this->reviewed_by ?? null,
            'notes'              => $this->notes ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
