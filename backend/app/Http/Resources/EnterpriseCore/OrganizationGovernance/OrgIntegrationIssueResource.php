<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgIntegrationIssueResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'type'        => $this->resource['type'] ?? 'WARNING',
            'category'    => $this->resource['category'] ?? null,
            'message'     => $this->resource['message'] ?? null,
            'message_ar'  => $this->resource['message_ar'] ?? null,
            'entity_type' => $this->resource['entity_type'] ?? null,
            'entity_id'   => $this->resource['entity_id'] ?? null,
        ];
    }
}
