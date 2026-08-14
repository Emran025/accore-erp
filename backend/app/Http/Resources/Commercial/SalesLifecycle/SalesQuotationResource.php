<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalesQuotationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quote_number' => $this->quote_number,
            'status' => $this->status,
            'issue_date' => $this->issue_date?->toDateString(),
            'valid_until' => $this->valid_until?->toDateString(),
            'currency' => $this->currency,
            'customer' => [
                'id' => $this->customer_id,
                'name' => $this->customer_name,
                'contact' => $this->customer_contact,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
            ],
            'warehouse' => $this->whenLoaded('warehouse', fn () => $this->warehouse ? [
                'id' => $this->warehouse->id,
                'code' => $this->warehouse->code,
                'name' => $this->warehouse->name,
            ] : null),
            'scope_summary' => $this->scope_summary,
            'payment_terms' => $this->payment_terms,
            'terms_conditions' => $this->terms_conditions,
            'notes' => $this->notes,
            'tax_rate' => (float) $this->tax_rate,
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'sent_at' => $this->sent_at?->toISOString(),
            'accepted_at' => $this->accepted_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'sku' => $item->sku,
                'description' => $item->description,
                'unit' => $item->unit,
                'quantity' => (float) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'discount_amount' => (float) $item->discount_amount,
                'line_total' => (float) $item->line_total,
                'is_optional' => $item->is_optional,
                'sort_order' => $item->sort_order,
            ])->values()),
        ];
    }
}
