<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'invoice_id'           => $this->invoice_id,
            'product_id'           => $this->product_id,
            'product_name'         => $this->product?->name ?? $this->product_name,
            'display_name'         => ($this->product?->name ?? $this->product_name) . " ({$this->quantity} " . ($this->unit_type === 'sub' ? $this->product?->sub_unit_name : $this->product?->unit_name) . ")",
            'quantity'             => (float) $this->quantity,
            'unit_type'            => $this->unit_type,
            'unit_name'            => $this->unit_type === 'sub' ? $this->product?->sub_unit_name : $this->product?->unit_name,
            'unit_price'           => (float) $this->unit_price,
            'subtotal'             => (float) $this->subtotal,
            'total_sub_units'      => (float) ($this->unit_type === 'main' ? ($this->quantity * ($this->product?->items_per_unit ?? 1)) : $this->quantity),
        ];
    }
}
