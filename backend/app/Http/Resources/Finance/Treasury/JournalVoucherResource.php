<?php

namespace App\Http\Resources\Finance\Treasury;

use Illuminate\Http\Resources\Json\JsonResource;

class JournalVoucherResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'voucher_number'   => $this->voucher_number,
            'voucher_date'     => $this->voucher_date instanceof \DateTimeInterface ? $this->voucher_date->toDateString() : $this->voucher_date,
            'description'      => $this->description,
            'status'           => $this->status,
            'total_debit'      => (float) ($this->total_debit ?? 0),
            'total_credit'     => (float) ($this->total_credit ?? 0),
            'fiscal_period_id' => $this->fiscal_period_id ?? null,
            'created_by'       => $this->created_by ?? null,
            'created_at'       => $this->created_at instanceof \DateTimeInterface ? $this->created_at->toDateTimeString() : $this->created_at,
            'updated_at'       => data_get($this->resource, 'updated_at') instanceof \DateTimeInterface ? data_get($this->resource, 'updated_at')->toDateTimeString() : data_get($this->resource, 'updated_at'),
            'lines'            => $this->lines ?? [],
        ];
    }
}
