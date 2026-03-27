<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class StructureLinkResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'source_node_uuid'  => $this->source_node_uuid,
            'target_node_uuid'  => $this->target_node_uuid,
            'topology_rule_id'  => $this->topology_rule_id,
            'link_type'         => $this->link_type,
            'priority'          => $this->priority,
            'valid_from'        => $this->valid_from?->toDateString() ?? $this->valid_from,
            'valid_to'          => $this->valid_to?->toDateString() ?? $this->valid_to,
            'created_at'        => $this->created_at?->toDateTimeString(),
            'source_node'       => new StructureNodeResource($this->whenLoaded('sourceNode')),
            'target_node'       => new StructureNodeResource($this->whenLoaded('targetNode')),
            'topology_rule'     => $this->whenLoaded('topologyRule'),
        ];
    }
}
