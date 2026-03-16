<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class BiometricDeviceResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'device_name'  => $this->device_name,
            'device_type'  => $this->device_type ?? null,
            'ip_address'   => $this->ip_address ?? null,
            'location'     => $this->location ?? null,
            'is_active'    => (bool) ($this->is_active ?? true),
            'last_sync_at' => $this->last_sync_at?->toDateTimeString() ?? $this->last_sync_at,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
