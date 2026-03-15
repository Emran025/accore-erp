<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgMetaTypeAttributeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'org_meta_type_id'  => $this->org_meta_type_id,
            'attribute_key'     => $this->attribute_key,
            'attribute_label'   => $this->attribute_label,
            'data_type'         => $this->data_type,
            'is_required'       => (bool) ($this->is_required ?? false),
            'default_value'     => $this->default_value ?? null,
            'sort_order'        => (int) ($this->sort_order ?? 0),
        ];
    }
}
