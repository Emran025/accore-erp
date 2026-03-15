<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxLineResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'tax_type_id'      => $this->tax_type_id,
            'tax_rate_id'      => $this->tax_rate_id,
            'taxable_type'     => $this->taxable_type,
            'taxable_id'       => $this->taxable_id,
            'taxable_amount'   => (float) ($this->taxable_amount ?? 0),
            'rate'             => (float) ($this->rate ?? 0),
            'tax_amount'       => (float) ($this->tax_amount ?? 0),
            'description'      => $this->description ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
