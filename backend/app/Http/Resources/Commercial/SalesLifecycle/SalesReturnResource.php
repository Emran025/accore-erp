<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesReturnResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'invoice_id'    => $this->invoice_id,
            'return_number' => $this->return_number,
            'return_date'   => $this->return_date?->toDateString() ?? $this->return_date,
            'total_amount'  => (float) $this->total_amount,
            'tax_amount'    => (float) $this->tax_amount,
            'reason'        => $this->reason,
            'status'        => $this->status,
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
            'items_count'   => $this->whenCounted('items'),
            'invoice'       => new InvoiceResource($this->whenLoaded('invoice')),
            'items'         => SalesReturnItemResource::collection($this->whenLoaded('items')),
            'tax_lines'     => $this->whenLoaded('taxLines'),
        ];
    }
}
