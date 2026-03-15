<?php

namespace App\Http\Resources\SupplyChain\PayablesExpenses;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Http\Resources\Json\JsonResource;

class ApTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        $amount = 0;
        if ($this->voucher_number) {
            $amount = (float) GeneralLedger::where('voucher_number', $this->voucher_number)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
        }

        return [
            'id'               => $this->id,
            'supplier_id'      => $this->supplier_id,
            'supplier_name'    => $this->supplier?->name,
            'type'             => $this->type,
            'amount'           => $amount,
            'voucher_number'   => $this->voucher_number,
            'description'      => $this->description,
            'reference_type'   => $this->reference_type,
            'reference_id'     => $this->reference_id,
            'transaction_date' => $this->transaction_date?->toDateTimeString(),
            'created_by'       => $this->created_by,
            'creator_name'     => $this->createdBy?->username,
            'is_deleted'       => (bool) ($this->is_deleted ?? false),
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
