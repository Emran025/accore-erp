<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class TopologyRuleResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'source_node_type_id'   => $this->source_node_type_id,
            'target_node_type_id'   => $this->target_node_type_id,
            'cardinality'           => $this->cardinality,
            'link_direction'        => $this->link_direction,
            'constraint_logic'      => $this->constraint_logic,
            'is_active'             => (bool) $this->is_active,
            'description'           => $this->description,
            'sort_order'            => (int) $this->sort_order,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'source_type'           => new OrgMetaTypeResource($this->whenLoaded('sourceType')),
            'target_type'           => new OrgMetaTypeResource($this->whenLoaded('targetType')),
        ];
    }
}
