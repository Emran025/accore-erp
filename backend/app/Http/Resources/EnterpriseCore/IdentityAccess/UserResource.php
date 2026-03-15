<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'full_name' => $this->full_name,
            'is_active' => (bool)$this->is_active,
            'last_login' => $this->last_login?->toDateTimeString(),
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
        ];
    }
}
