<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgMetaTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'display_name'    => $this->display_name,
            'display_name_ar' => $this->display_name_ar,
            'level_domain'    => $this->level_domain,
            'description'     => $this->description,
            'is_assignable'   => (bool) $this->is_assignable,
            'sort_order'      => (int) $this->sort_order,
            'attributes'      => OrgMetaTypeAttributeResource::collection($this->whenLoaded('attributes')),

            // Legacy aliases retained so existing API consumers continue to receive the fields
            // that were exposed by earlier versions of this resource.
            'type_key'        => $this->id,
            'type_name'       => $this->display_name,
            'type_name_en'    => $this->display_name,
            'icon'            => null,
            'color'           => null,
            'is_active'       => true,
            'created_at'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
