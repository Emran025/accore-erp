<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class DisciplinaryActionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'case_id'         => $this->case_id ?? null,
            'action_type'     => $this->action_type,
            'description'     => $this->description ?? null,
            'action_date'     => $this->action_date?->toDateString() ?? $this->action_date,
            'status'          => $this->status ?? null,
            'issued_by'       => $this->issued_by ?? null,
            'notes'           => $this->notes ?? null,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
