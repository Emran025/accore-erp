<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'ip_address'   => $this->ip_address,
            'user_agent'   => $this->user_agent,
            'is_active'    => (bool) ($this->is_active ?? true),
            'last_active'  => $this->last_active?->toDateTimeString() ?? $this->last_active,
            'expires_at'   => $this->expires_at?->toDateTimeString() ?? $this->expires_at,
            'created_at'   => $this->created_at?->toDateTimeString(),
        ];
    }
}
