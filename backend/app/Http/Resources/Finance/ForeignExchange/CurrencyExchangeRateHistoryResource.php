<?php

namespace App\Http\Resources\Finance\ForeignExchange;

use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyExchangeRateHistoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'currency_policy_id'  => $this->currency_policy_id,
            'from_currency_id'    => $this->from_currency_id,
            'to_currency_id'      => $this->to_currency_id,
            'rate'                => (float) $this->rate,
            'effective_date'      => $this->effective_date?->toDateString() ?? $this->effective_date,
            'source'              => $this->source ?? null,
            'recorded_by'         => $this->recorded_by ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
        ];
    }
}
