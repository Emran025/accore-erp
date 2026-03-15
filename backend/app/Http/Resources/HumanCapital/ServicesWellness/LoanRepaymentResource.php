<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class LoanRepaymentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'loan_id'          => $this->loan_id,
            'installment_no'   => (int) ($this->installment_no ?? 0),
            'due_date'         => $this->due_date?->toDateString() ?? $this->due_date,
            'payment_date'     => $this->payment_date?->toDateString() ?? $this->payment_date,
            'amount'           => (float) ($this->amount ?? 0),
            'status'           => $this->status ?? null,
            'notes'            => $this->notes ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
