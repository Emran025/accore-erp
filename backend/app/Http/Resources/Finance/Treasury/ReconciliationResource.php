<?php

namespace App\Http\Resources\Finance\Treasury;

use Illuminate\Http\Resources\Json\JsonResource;

class ReconciliationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'account_code'       => $this->account_code,
            'reconciliation_date' => $this->reconciliation_date?->toDateString(),
            'ledger_balance'     => (float) $this->ledger_balance,
            'physical_balance'   => (float) $this->physical_balance,
            'difference'         => (float) $this->difference,
            'status'             => $this->status,
            'notes'              => $this->notes,
            'adjustment_notes'   => $this->adjustment_notes,
            'reconciled_by'      => $this->reconciled_by,
            'reconciler_name'    => $this->reconciledBy?->full_name,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
