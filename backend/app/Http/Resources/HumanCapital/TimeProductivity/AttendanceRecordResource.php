<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceRecordResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'attendance_date' => $this->attendance_date?->toDateString(),
            'check_in'        => $this->check_in?->toDateTimeString(),
            'check_out'       => $this->check_out?->toDateTimeString(),
            'status'          => $this->status,
            'hours_worked'    => (float) $this->hours_worked,
            'overtime_hours'  => (float) $this->overtime_hours,
            'is_late'         => (bool) $this->is_late,
            'late_minutes'    => (int) $this->late_minutes,
            'notes'           => $this->notes,
            'source'          => $this->source,
            'created_by'      => $this->created_by,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
