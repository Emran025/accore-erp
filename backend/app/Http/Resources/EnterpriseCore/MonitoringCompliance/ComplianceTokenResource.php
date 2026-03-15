<?php

namespace App\Http\Resources\EnterpriseCore\MonitoringCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class ComplianceTokenResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'access_token'     => $this->resource['access_token'] ?? null,
            'token_expires_at' => $this->resource['token_expires_at'] ?? null,
            'pull_endpoint'    => $this->resource['pull_endpoint'] ?? null,
        ];
    }
}
