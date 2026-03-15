<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleShiftResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'schedule_id'     => $this->schedule_id ?? null,
            'employee_id'     => $this->employee_id,
            'shift_date'      => $this->shift_date?->toDateString() ?? $this->shift_date,
            'shift_start'     => $this->shift_start,
            'shift_end'       => $this->shift_end,
            'shift_type'      => $this->shift_type ?? null,
            'notes'           => $this->notes ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
