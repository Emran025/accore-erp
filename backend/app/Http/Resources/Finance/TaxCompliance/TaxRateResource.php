<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxRateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'tax_type_id'    => $this->tax_type_id,
            'rate'           => (float) $this->rate,
            'fixed_amount'   => $this->fixed_amount ? (float) $this->fixed_amount : null,
            'effective_from' => $this->effective_from?->toDateString(),
            'effective_to'   => $this->effective_to?->toDateString(),
            'description'    => $this->description ?? null,
            'is_default'     => (bool) $this->is_default,
            'created_at'     => $this->created_at?->toDateTimeString(),
        ];
    }
}
