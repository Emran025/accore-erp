<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgMetaTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'type_key'      => $this->type_key,
            'type_name'     => $this->type_name,
            'type_name_en'  => $this->type_name_en ?? null,
            'description'   => $this->description ?? null,
            'icon'          => $this->icon ?? null,
            'color'         => $this->color ?? null,
            'is_active'     => (bool) ($this->is_active ?? true),
            'sort_order'    => (int) ($this->sort_order ?? 0),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'attributes'    => OrgMetaTypeAttributeResource::collection($this->whenLoaded('attributes')),
        ];
    }
}
