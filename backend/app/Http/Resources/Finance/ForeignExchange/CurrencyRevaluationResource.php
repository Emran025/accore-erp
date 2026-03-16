<?php

namespace App\Http\Resources\Finance\ForeignExchange;

use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyRevaluationResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'currency_policy_id'  => $this->currency_policy_id,
            'revaluation_date'    => $this->revaluation_date?->toDateString() ?? $this->revaluation_date,
            'fiscal_period_id'    => $this->fiscal_period_id,
            'status'              => $this->status,
            'total_gain_loss'     => (float) ($this->total_gain_loss ?? 0),
            'processed_by'        => $this->processed_by ?? null,
            'processed_at'        => $this->processed_at?->toDateTimeString() ?? $this->processed_at,
            'notes'               => $this->notes ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
        ];
    }
}
