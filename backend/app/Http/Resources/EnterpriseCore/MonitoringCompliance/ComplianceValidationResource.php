<?php

namespace App\Http\Resources\EnterpriseCore\MonitoringCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class ComplianceValidationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'valid'  => (bool) ($this->resource['valid'] ?? false),
            'errors' => $this->resource['errors'] ?? [],
        ];
    }
}
