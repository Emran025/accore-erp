<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxTypeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'tax_authority_id'   => $this->tax_authority_id,
            'code'               => $this->code,
            'name'               => $this->name,
            'gl_account_code'    => $this->gl_account_code,
            'calculation_type'   => $this->calculation_type,
            'applicable_areas'   => $this->applicable_areas,
            'is_active'          => (bool) $this->is_active,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
            'tax_rates'          => TaxRateResource::collection($this->whenLoaded('taxRates')),
        ];
    }
}
