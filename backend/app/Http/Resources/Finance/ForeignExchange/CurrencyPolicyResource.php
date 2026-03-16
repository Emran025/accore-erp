<?php

namespace App\Http\Resources\Finance\ForeignExchange;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Domains\Finance\ForeignExchange\Models\Currency;

class CurrencyPolicyResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                           => $this->id,
            'code'                         => $this->code,
            'policy_type'                  => $this->policy_type instanceof \BackedEnum
                ? $this->policy_type->value
                : $this->policy_type,
            'description'                  => $this->description,
            'is_active'                    => (bool) $this->is_active,
            'requires_reference_currency'  => (bool) $this->requires_reference_currency,
            'allow_multi_currency_balances' => (bool) ($this->allow_multi_currency_balances ?? false),
            'revaluation_enabled'          => (bool) ($this->revaluation_enabled ?? false),
            'conversion_timing'            => $this->conversion_timing instanceof \BackedEnum
                ? $this->conversion_timing->value
                : $this->conversion_timing,
            'activated_at'                 => $this->activated_at?->toDateTimeString() ?? $this->activated_at,
            'reference_currency'           => new CurrencyResource(Currency::where('is_primary', true)->first()),
            'created_at'                   => $this->created_at?->toDateTimeString(),
            'updated_at'                   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
