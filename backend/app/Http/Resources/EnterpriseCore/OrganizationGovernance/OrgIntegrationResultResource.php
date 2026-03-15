<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgIntegrationResultResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'type'           => $this->resource['type'] ?? null,
            'cost_center'    => $this->resource['cost_center'] ?? null,
            'profit_center'  => $this->resource['profit_center'] ?? null,
            'structure_node' => $this->resource['structure_node'] ?? null,
            'center'         => $this->resource['center'] ?? null,
            'node'           => $this->resource['node'] ?? null,
            'job_title_id'   => $this->resource['job_title_id'] ?? null,
            'positions_updated' => $this->resource['positions_updated'] ?? null,
            'employees_updated' => $this->resource['employees_updated'] ?? null,
        ];
    }
}
