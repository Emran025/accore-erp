<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesReturnResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'return_number' => $this->return_number,
            'return_date' => $this->return_date,
            'total_amount' => (float) $this->total_amount,
            'tax_amount' => (float) $this->tax_amount,
            'reason' => $this->reason,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'items_count' => $this->whenCounted('items'),
            'invoice' => new InvoiceResource($this->whenLoaded('invoice')),
            'user' => $this->whenLoaded('user'),
            'items' => $this->whenLoaded('items'),
            'tax_lines' => $this->whenLoaded('taxLines'),
        ];
    }
}
