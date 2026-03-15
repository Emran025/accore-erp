<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissionTemplateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'template_name' => $this->template_name,
            'template_key'  => $this->template_key,
            'description'   => $this->description,
            'permissions'   => $this->permissions,
            'is_active'     => (bool) ($this->is_active ?? true),
            'created_by'  => $this->created_by,
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
