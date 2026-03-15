<?php

namespace App\Http\Resources\Finance\ForeignExchange;

use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyDenominationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'currency_id' => $this->currency_id,
            'value'       => (float) $this->value,
            'label'       => $this->label,
            'type'        => $this->type,
        ];
    }
}
