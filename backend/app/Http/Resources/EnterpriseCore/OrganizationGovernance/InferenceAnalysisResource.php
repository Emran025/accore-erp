<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class InferenceAnalysisResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'signals'            => $this->resource['signals'] ?? [],
            'evaluation'         => $this->resource['evaluation'] ?? [],
            'adaptive_questions' => $this->resource['adaptive_questions'] ?? [],
            'blueprint'          => $this->resource['blueprint'] ?? null,
        ];
    }
}
