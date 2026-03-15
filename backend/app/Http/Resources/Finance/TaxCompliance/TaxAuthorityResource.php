<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class TaxAuthorityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
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
