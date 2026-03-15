<?php

namespace App\Http\Resources\Finance\GeneralLedger;

use Illuminate\Http\Resources\Json\JsonResource;

class UniversalJournalResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'journal_number'   => $this->journal_number ?? null,
            'voucher_number'   => $this->voucher_number,
            'voucher_date'     => $this->voucher_date?->toDateString() ?? $this->voucher_date,
            'description'      => $this->description,
            'status'           => $this->status,
            'total_debit'      => (float) ($this->total_debit ?? 0),
            'total_credit'     => (float) ($this->total_credit ?? 0),
            'fiscal_period_id' => $this->fiscal_period_id,
            'created_by'       => $this->created_by,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'lines'            => GeneralLedgerResource::collection($this->whenLoaded('lines')),
        ];
    }
}
