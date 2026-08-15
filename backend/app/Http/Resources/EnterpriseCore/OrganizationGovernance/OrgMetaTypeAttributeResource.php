<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgMetaTypeAttributeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'org_meta_type_id' => $this->org_meta_type_id,
            'attribute_key'    => $this->attribute_key,
            'attribute_type'   => $this->attribute_type,
            'is_mandatory'     => (bool) $this->is_mandatory,
            'default_value'    => $this->default_value,
            'validation_rule'  => $this->validation_rule,
            'reference_type_id'=> $this->reference_type_id,
            'sort_order'       => (int) $this->sort_order,

            // Legacy aliases retained for API consumers using the previous resource contract.
            'attribute_label'  => $this->attribute_key,
            'data_type'        => $this->attribute_type,
            'is_required'      => (bool) $this->is_mandatory,
        ];
    }
}
