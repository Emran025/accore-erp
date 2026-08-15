<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Localization\LocalizedValue;

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
            'description'    => LocalizedValue::resolve($this->resource, 'description'),
            'description_ar' => $this->description_ar,
            'description_en' => $this->description_en,
            'description_translations' => LocalizedValue::translations($this->resource, 'description'),
            'is_default'     => (bool) $this->is_default,
            'created_at'     => $this->created_at?->toDateTimeString(),
        ];
    }
}
