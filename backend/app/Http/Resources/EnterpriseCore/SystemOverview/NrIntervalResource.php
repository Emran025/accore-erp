<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrIntervalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'from_number'  => (int) ($this->from_number ?? $this->from ?? 0),
            'to_number'    => (int) ($this->to_number ?? $this->to ?? 0),
            'current'      => (int) ($this->current ?? 0),
            'prefix'       => $this->prefix ?? null,
            'suffix'       => $this->suffix ?? null,
            'is_active'    => (bool) ($this->is_active ?? true),
            'created_at'   => $this->created_at?->toDateTimeString(),
        ];
    }
}
