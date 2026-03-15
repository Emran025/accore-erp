<?php

namespace App\Http\Resources\SupplyChain\Procurement;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'product_id'       => $this->product_id,
            'product_name'     => $this->product?->name,
            'supplier_id'      => $this->supplier_id,
            'supplier_name'    => $this->supplier?->name,
            'quantity'         => (int) ($this->quantity ?? 0),
            'invoice_price'    => (float) ($this->invoice_price ?? 0),
            'unit_type'        => $this->unit_type ?? null,
            'production_date'  => $this->production_date?->toDateString() ?? $this->production_date,
            'expiry_date'      => $this->expiry_date?->toDateString() ?? $this->expiry_date,
            'payment_type'     => $this->payment_type ?? null,
            'user_id'          => $this->user_id,
            'voucher_number'   => $this->voucher_number ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
        ];
    }
}
