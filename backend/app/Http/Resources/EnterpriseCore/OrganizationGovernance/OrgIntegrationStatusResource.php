<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgIntegrationStatusResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'cost_centers'   => $this->resource['cost_centers'] ?? [],
            'profit_centers' => $this->resource['profit_centers'] ?? [],
            'job_titles'     => $this->resource['job_titles'] ?? [],
            'health'         => $this->resource['health'] ?? [],
        ];
    }
}
