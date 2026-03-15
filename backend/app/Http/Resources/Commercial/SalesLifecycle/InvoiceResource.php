<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'invoice_number'  => $this->invoice_number,
            'customer_id'     => $this->customer_id,
            'customer_name'   => $this->customer?->name,
            'invoice_date'    => $this->invoice_date?->toDateString(),
            'due_date'        => $this->due_date?->toDateString(),
            'status'          => $this->status,
            'total_amount'    => (float) $this->total_amount,
            'tax_amount'      => (float) ($this->tax_amount ?? 0),
            'discount_amount' => (float) ($this->discount_amount ?? 0),
            'net_amount'      => (float) ($this->net_amount ?? $this->total_amount),
            'notes'           => $this->notes,
            'created_by'      => $this->created_by,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
            'items_count'     => $this->whenCounted('items'),
            'items'           => InvoiceItemResource::collection($this->whenLoaded('items')),
            'tax_lines'       => $this->whenLoaded('taxLines'),
        ];
    }
}
