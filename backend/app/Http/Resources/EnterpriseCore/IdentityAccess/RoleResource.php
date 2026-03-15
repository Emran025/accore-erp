<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => (bool)$this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Permissions could be added here if loaded
            'permissions' => $this->whenLoaded('permissions', function() {
                return $this->permissions->pluck('name');
            }),
        ];
    }
}
