<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class StructureNodeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'node_type_id'     => $this->node_type_id,
            'node_code'        => $this->node_code,
            'node_name'        => $this->node_name,
            'node_name_en'     => $this->node_name_en ?? null,
            'description'      => $this->description ?? null,
            'is_active'        => (bool) ($this->is_active ?? true),
            'effective_from'   => $this->effective_from?->toDateString() ?? $this->effective_from,
            'effective_to'     => $this->effective_to?->toDateString() ?? $this->effective_to,
            'sort_order'       => (int) ($this->sort_order ?? 0),
            'metadata'         => $this->metadata ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'node_type'        => new OrgMetaTypeResource($this->whenLoaded('nodeType')),
        ];
    }
}
