<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class ModuleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'module_key'  => $this->module_key,
            'name'        => $this->module_name_ar,
            'name_ar'     => $this->module_name_ar,
            'name_en'     => $this->module_name_en,
            'category'    => $this->category,
            'description' => $this->description,
            'is_active'   => (bool) ($this->is_active ?? true),
            'sort_order'  => (int) ($this->sort_order ?? 0),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
