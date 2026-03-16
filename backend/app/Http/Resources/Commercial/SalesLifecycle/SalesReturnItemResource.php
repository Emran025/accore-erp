<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesReturnItemResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'sales_return_id'  => $this->sales_return_id,
            'invoice_item_id'  => $this->invoice_item_id,
            'product_id'       => $this->product_id,
            'product_name'     => $this->product?->name,
            'quantity'         => (int) ($this->quantity ?? 0),
            'unit_price'       => (float) ($this->unit_price ?? 0),
            'subtotal'         => (float) ($this->subtotal ?? 0),
            'reason'           => $this->reason ?? null,
        ];
    }
}
