<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'leave_type'      => $this->leave_type,
            'start_date'      => $this->start_date?->toDateString() ?? $this->start_date,
            'end_date'        => $this->end_date?->toDateString() ?? $this->end_date,
            'total_days'      => (float) ($this->total_days ?? 0),
            'status'          => $this->status,
            'reason'          => $this->reason ?? null,
            'approved_by'     => $this->approved_by ?? null,
            'approved_at'     => $this->approved_at?->toDateTimeString() ?? $this->approved_at,
            'rejection_reason' => $this->rejection_reason ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
