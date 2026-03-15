<?php

namespace App\Http\Resources\Finance\ManagementAccounting;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'category'       => $this->category,
            'account_code'   => $this->account_code,
            'voucher_number' => $this->voucher_number,
            'expense_date'   => $this->expense_date?->toDateTimeString() ?? $this->expense_date,
            'description'    => $this->description,
            'payment_type'   => $this->payment_type,
            'supplier_id'    => $this->supplier_id,
            'user_id'        => $this->user_id,
            'amount'         => (float) ($this->amount ?? 0),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
