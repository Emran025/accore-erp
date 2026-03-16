<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrIntervalResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'description'      => $this->description,
            'from_number'      => (int) $this->from_number,
            'to_number'        => (int) $this->to_number,
            'current_number'   => (int) $this->current_number,
            'is_external'      => (bool) $this->is_external,
            'is_active'        => (bool) $this->is_active,
            'capacity'         => $this->capacity,
            'used'             => $this->used,
            'remaining'        => $this->remaining,
            'fullness_percent' => $this->fullness_percent,
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
