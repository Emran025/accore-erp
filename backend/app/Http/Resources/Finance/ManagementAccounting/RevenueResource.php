<?php

namespace App\Http\Resources\Finance\ManagementAccounting;

use Illuminate\Http\Resources\Json\JsonResource;

class RevenueResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'category'         => $this->category ?? null,
            'account_code'     => $this->account_code ?? null,
            'voucher_number'   => $this->voucher_number ?? null,
            'revenue_date'     => $this->revenue_date?->toDateTimeString() ?? $this->revenue_date,
            'description'      => $this->description ?? null,
            'amount'           => (float) ($this->amount ?? 0),
            'profit_center_id' => $this->profit_center_id ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
