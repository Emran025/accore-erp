<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'invoice_id'           => $this->invoice_id,
            'product_id'           => $this->product_id,
            'product_name'         => $this->product?->name,
            'quantity'             => (int) $this->quantity,
            'unit_price'           => (float) $this->unit_price,
            'subtotal'             => (float) $this->subtotal,
            'unit_type'            => $this->unit_type,
        ];
    }
}
