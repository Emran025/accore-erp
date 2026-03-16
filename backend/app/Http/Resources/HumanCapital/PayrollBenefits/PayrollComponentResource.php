<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class PayrollComponentResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'code'                => $this->code,
            'type'                => $this->type, // e.g., allowance, deduction
            'calculation_method' => $this->calculation_method,
            'amount_value'       => (float) $this->amount_value,
            'is_taxable'          => (bool) $this->is_taxable,
            'is_pensionable'      => (bool) $this->is_pensionable,
            'gl_account_id'       => $this->gl_account_id,
            'status'              => $this->status,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
