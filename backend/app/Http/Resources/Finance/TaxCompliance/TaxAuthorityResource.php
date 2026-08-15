<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Localization\LocalizedValue;

class TaxAuthorityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => LocalizedValue::resolve($this->resource, 'name'),
            'name_ar'         => $this->name_ar,
            'name_en'         => $this->name_en,
            'code'            => $this->code ?? null,
            'country'         => $this->country ?? null,
            'api_endpoint'    => $this->api_endpoint ?? null,
            'is_active'       => (bool) ($this->is_active ?? true),
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
            'tax_types'       => TaxTypeResource::collection($this->whenLoaded('taxTypes')),
        ];
    }
}
