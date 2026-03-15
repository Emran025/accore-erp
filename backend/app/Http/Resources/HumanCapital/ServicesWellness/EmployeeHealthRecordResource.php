<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeHealthRecordResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'record_date'     => $this->record_date?->toDateString() ?? $this->record_date,
            'record_type'     => $this->record_type ?? null,
            'description'     => $this->description ?? null,
            'status'          => $this->status ?? null,
            'notes'           => $this->notes ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
