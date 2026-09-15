<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgPerspectiveResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'perspective' => $this->resource['perspective'] ?? 'all',
            'as_of_date'  => $this->resource['as_of_date'] ?? now()->toDateString(),
            'nodes'       => StructureNodeResource::collection($this->resource['nodes'] ?? []),
            'links'       => StructureLinkResource::collection($this->resource['links'] ?? []),
            'root_nodes'  => StructureNodeResource::collection($this->resource['root_nodes'] ?? []),
            'statistics'  => $this->resource['statistics'] ?? [],
        ];
    }
}
