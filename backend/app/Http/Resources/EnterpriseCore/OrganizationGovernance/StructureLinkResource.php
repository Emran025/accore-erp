<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class StructureLinkResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'parent_node_id'    => $this->parent_node_id,
            'child_node_id'     => $this->child_node_id,
            'topology_rule_id'  => $this->topology_rule_id,
            'link_metadata'     => $this->link_metadata ?? null,
            'is_active'         => (bool) ($this->is_active ?? true),
            'effective_from'    => $this->effective_from?->toDateString() ?? $this->effective_from,
            'effective_to'      => $this->effective_to?->toDateString() ?? $this->effective_to,
            'created_at'        => $this->created_at?->toDateTimeString(),
            'parent_node'       => new StructureNodeResource($this->whenLoaded('parentNode')),
            'child_node'        => new StructureNodeResource($this->whenLoaded('childNode')),
        ];
    }
}
