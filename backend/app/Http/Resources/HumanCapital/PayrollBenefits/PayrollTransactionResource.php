<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class PayrollTransactionResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'payroll_entry_id'    => $this->payroll_entry_id,
            'transaction_date'    => $this->transaction_date,
            'amount'              => (float) $this->amount,
            'payment_method'      => $this->payment_method,
            'reference_number'    => $this->reference_number,
            'status'              => $this->status,
            'description'         => $this->description,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
