<?php

namespace App\Http\Resources\Finance\ForeignExchange;

use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'code'         => $this->code,
            'name'         => $this->name,
            'symbol'       => $this->symbol,
            'is_primary'   => (bool) ($this->is_primary ?? false),
            'is_active'    => (bool) ($this->is_active ?? true),
            'decimal_places' => (int) ($this->decimal_places ?? 2),
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
            'denominations' => CurrencyDenominationResource::collection($this->whenLoaded('denominations')),
        ];
    }
}
