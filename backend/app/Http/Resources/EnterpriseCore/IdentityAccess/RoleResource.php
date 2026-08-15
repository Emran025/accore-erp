<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Localization\LocalizedValue;

class RoleResource extends JsonResource
{
    public function toArray($request): array
    {
        $descriptionTranslations = LocalizedValue::translations($this->resource, 'description');

        return [
            'id'           => $this->id,
            'role_name'    => (app()->getLocale() === 'ar' ? $this->role_name_ar : $this->role_name_en) ?? $this->role_name_ar ?? $this->name ?? $this->role_name,
            'role_name_ar' => $this->role_name_ar,
            'role_name_en' => $this->role_name_en,
            'role_key'     => $this->role_key,
            'description' => LocalizedValue::resolve($this->resource, 'description'),
            'description_ar' => $descriptionTranslations['ar'],
            'description_en' => $descriptionTranslations['en'],
            'description_translations' => $descriptionTranslations,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
            'permissions' => RolePermissionResource::collection($this->whenLoaded('permissions')),
        ];
    }
}
