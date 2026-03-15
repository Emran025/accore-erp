<?php

namespace App\Http\Resources\Finance\GeneralLedger;

use Illuminate\Http\Resources\Json\JsonResource;

class GeneralLedgerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'voucher_number'   => $this->voucher_number,
            'voucher_date'     => $this->voucher_date?->toDateString() ?? $this->voucher_date,
            'account_id'       => $this->account_id,
            'account_code'     => $this->account?->account_code,
            'account_name'     => $this->account?->account_name,
            'entry_type'       => $this->entry_type,
            'entry_source'     => $this->entry_source,
            'amount'           => (float) $this->amount,
            'description'      => $this->description,
            'reference_type'   => $this->reference_type,
            'reference_id'     => $this->reference_id,
            'fiscal_period_id' => $this->fiscal_period_id,
            'cost_center_id'   => $this->cost_center_id,
            'profit_center_id' => $this->profit_center_id,
            'currency_id'      => $this->currency_id,
            'exchange_rate'    => $this->exchange_rate ? (float) $this->exchange_rate : null,
            'is_closed'        => (bool) ($this->is_closed ?? false),
            'created_by'       => $this->created_by,
        ];
    }
}
