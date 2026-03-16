<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class WorkforceScheduleResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'schedule_name' => $this->schedule_name,
            'schedule_date' => $this->schedule_date?->toDateString(),
            'department_id' => $this->department_id,
            'status'        => $this->status,
            'notes'         => $this->notes ?? null,
            'created_by'    => $this->created_by,
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
            'shifts'        => ScheduleShiftResource::collection($this->whenLoaded('shifts')),
        ];
    }
}
