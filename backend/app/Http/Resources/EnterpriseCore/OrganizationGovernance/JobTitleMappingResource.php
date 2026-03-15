<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class JobTitleMappingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'job_title' => [
                'id'         => $this->resource['job_title']['id'] ?? null,
                'title_ar'   => $this->resource['job_title']['title_ar'] ?? null,
                'title_en'   => $this->resource['job_title']['title_en'] ?? null,
                'department' => $this->resource['job_title']['department'] ?? null,
                'is_active'  => $this->resource['job_title']['is_active'] ?? null,
            ],
            'positions'       => $this->resource['positions'] ?? [],
            'employees'       => $this->resource['employees'] ?? [],
            'org_chart_nodes' => $this->resource['org_chart_nodes'] ?? [],
            'summary'         => $this->resource['summary'] ?? [],
        ];
    }
}
