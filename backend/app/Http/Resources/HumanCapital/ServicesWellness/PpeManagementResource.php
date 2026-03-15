<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class PpeManagementResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'employee_id'        => $this->employee_id,
            'ppe_type'           => $this->ppe_type,
            'description'        => $this->description ?? null,
            'issue_date'         => $this->issue_date?->toDateString() ?? $this->issue_date,
            'expiry_date'        => $this->expiry_date?->toDateString() ?? $this->expiry_date,
            'return_date'        => $this->return_date?->toDateString() ?? $this->return_date,
            'status'             => $this->status,
            'quantity'           => (int) ($this->quantity ?? 1),
            'notes'              => $this->notes ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
