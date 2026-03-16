<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'invoice_number'        => $this->invoice_number,
            'voucher_number'        => $this->voucher_number,
            'customer_id'           => $this->customer_id,
            'customer_name'         => $this->customer?->name,
            'customer_phone'        => $this->customer?->phone,
            'customer_tax'          => $this->customer?->tax_number,
            'payment_type'          => $this->payment_type,
            'subtotal'              => (float) $this->subtotal,
            'vat_amount'            => (float) $this->vat_amount,
            'vat_rate'              => (float) $this->vat_rate,
            'total_amount'          => (float) $this->total_amount,
            'discount_amount'       => (float) $this->discount_amount,
            'amount_paid'           => (float) $this->amount_paid,
            'item_count'           => $this->items_count ?? ($this->relationLoaded('items') ? $this->items->count() : 0),
            'salesperson_name'      => $this->user?->name ?? 'System',
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'items'                 => InvoiceItemResource::collection($this->whenLoaded('items')),
            'tax_lines'             => $this->whenLoaded('taxLines'),
        ];
    }
}
