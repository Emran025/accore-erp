<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class RolePermissionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'role_id'     => $this->role_id,
            'module_key'  => $this->module_key,
            'can_view'    => (bool) ($this->can_view ?? false),
            'can_create'  => (bool) ($this->can_create ?? false),
            'can_edit'    => (bool) ($this->can_edit ?? false),
            'can_delete'  => (bool) ($this->can_delete ?? false),
            'can_export'  => (bool) ($this->can_export ?? false),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
