<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        $id            = $this->invoice_id ?? $this->id;
        $customerName  = $this->customer_name ?? $this->customer?->name;
        $customerPhone = $this->customer_phone ?? $this->customer?->phone;
        $customerTax   = $this->customer?->tax_number ?? $this->tax_number ?? null;
        $salesperson   = $this->created_by_name ?? $this->salesperson_name ?? $this->user?->full_name ?? 'System';
        $totalAmount   = (float) ($this->total_amount ?? $this->gl_debit_total ?? 0);
        $vatAmount     = (float) ($this->vat_amount ?? $this->tax_total ?? 0);
        $subtotal      = (float) ($this->subtotal ?? $this->items_subtotal ?? 0);
        $itemCount     = (int)   ($this->item_count ?? $this->items_count ?? ($this->relationLoaded('items') ? $this->items->count() : 0));

        return [
            'id'                    => $id,
            'invoice_number'        => $this->invoice_number,
            'voucher_number'        => $this->voucher_number,
            'customer_id'           => $this->customer_id,
            'customer_name'         => $customerName,
            'customer_phone'        => $customerPhone,
            'customer_tax'          => $customerTax,
            'payment_type'          => $this->payment_type,
            'subtotal'              => $subtotal,
            'vat_amount'            => $vatAmount,
            'vat_rate'              => (float) ($this->vat_rate ?? 15),
            'total_amount'          => $totalAmount,
            'discount_amount'       => (float) ($this->discount_amount ?? 0),
            'amount_paid'           => (float) ($this->amount_paid ?? 0),
            'item_count'            => $itemCount,
            'salesperson_name'      => $salesperson,
            'created_at'            => is_string($this->created_at) ? $this->created_at : $this->created_at?->toDateTimeString(),
            'updated_at'            => is_string($this->updated_at) ? $this->updated_at : $this->updated_at?->toDateTimeString(),
            'items'                 => InvoiceItemResource::collection($this->whenLoaded('items')),
            'tax_lines'             => $this->whenLoaded('taxLines'),
        ];
    }
}

