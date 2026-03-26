<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceItemResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        $returnedQuantity = $this->relationLoaded('returns')
            ? (int) $this->returns->sum('quantity')
            : (int) $this->returns()->sum('quantity');

        $originalQuantity = (float) $this->quantity + $returnedQuantity;
        $remainingQuantity = (float) $this->quantity;

        return [
            'id'                   => $this->id,
            'invoice_id'           => $this->invoice_id,
            'product_id'           => $this->product_id,
            'product_name'         => $this->product?->name ?? $this->product_name,
            'service_name'         => $this->product?->item_type === 'service' ? $this->product?->name : null,
            'display_name'         => ($this->product?->name ?? $this->product_name) . " ({$remainingQuantity} " . ($this->unit_type === 'sub' ? $this->product?->sub_unit_name : $this->product?->unit_name) . ")",
            'quantity'             => $remainingQuantity,
            'original_quantity'    => $originalQuantity,
            'returned_quantity'    => $returnedQuantity,
            'unit_type'            => $this->unit_type,
            'unit_name'            => $this->unit_type === 'sub' ? $this->product?->sub_unit_name : $this->product?->unit_name,
            'unit_price'           => (float) $this->unit_price,
            'subtotal'             => (float) $this->subtotal,
            'total_sub_units'      => (float) ($this->unit_type === 'main' ? ($remainingQuantity * ($this->product?->items_per_unit ?? 1)) : $remainingQuantity),
        ];
    }
}
