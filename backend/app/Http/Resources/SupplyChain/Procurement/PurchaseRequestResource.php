<?php

namespace App\Http\Resources\SupplyChain\Procurement;

use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'product_id'   => $this->product_id,
            'product_name' => $this->product?->name ?? $this->product_name,
            'quantity'     => (int) $this->quantity,
            'user_id'      => $this->user_id,
            'status'       => $this->status,
            'notes'        => $this->notes ?? null,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
