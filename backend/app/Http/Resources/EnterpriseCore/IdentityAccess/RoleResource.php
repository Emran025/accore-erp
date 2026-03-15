<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'role_name'   => $this->role_name,
            'role_key'    => $this->role_key,
            'description' => $this->description,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
            'permissions' => RolePermissionResource::collection($this->whenLoaded('permissions')),
        ];
    }
}
