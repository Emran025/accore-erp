<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class ComplianceProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'entity_type'     => $this->entity_type ?? null,
            'entity_id'       => $this->entity_id ?? null,
            'policy_type'     => $this->policy_type ?? null,
            'access_token'    => $this->when(false, $this->access_token),
            'is_active'       => (bool) ($this->is_active ?? true),
            'key_mapping'     => $this->key_mapping ?? null,
            'token_expires_at' => $this->token_expires_at?->toDateTimeString() ?? $this->token_expires_at,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
