<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class StructureNodeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'node_uuid'        => $this->node_uuid,
            'node_type_id'     => $this->node_type_id,
            'code'             => $this->code,
            'attributes_json'  => $this->attributes_json ?? [],
            'status'           => $this->status,
            'valid_from'       => $this->valid_from?->toDateString() ?? $this->valid_from,
            'valid_to'         => $this->valid_to?->toDateString() ?? $this->valid_to,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'meta_type'        => new OrgMetaTypeResource($this->whenLoaded('metaType')),
            'outgoing_links'   => StructureLinkResource::collection($this->whenLoaded('outgoingLinks')),
            'incoming_links'   => StructureLinkResource::collection($this->whenLoaded('incomingLinks')),
        ];
    }
}
