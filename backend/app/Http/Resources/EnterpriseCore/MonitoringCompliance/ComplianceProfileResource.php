<?php

namespace App\Http\Resources\EnterpriseCore\MonitoringCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class ComplianceProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'code'               => $this->code,
            'description'        => $this->description,
            'tax_authority_id'   => $this->tax_authority_id,
            'policy_identifier'  => $this->policy_identifier,
            'connection_type'    => $this->connection_type, // 'push', 'pull', 'sync'
            'endpoint_url'       => $this->endpoint_url,
            'is_active'          => (bool) $this->is_active,
            'settings'           => $this->settings,
            'tax_authority'      => $this->whenLoaded('taxAuthority'),
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
