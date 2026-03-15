<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissionTemplateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'description' => $this->description,
            'permissions' => $this->permissions,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_by'  => $this->created_by,
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
