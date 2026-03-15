<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryCountResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'product_id'       => $this->product_id,
            'product_name'     => $this->product?->name,
            'fiscal_period_id' => $this->fiscal_period_id,
            'count_date'       => $this->count_date?->toDateString(),
            'book_quantity'    => (int) $this->book_quantity,
            'counted_quantity' => (int) $this->counted_quantity,
            'variance'         => (int) $this->variance,
            'notes'            => $this->notes ?? null,
            'is_processed'     => (bool) $this->is_processed,
            'processed_at'     => $this->processed_at?->toDateTimeString(),
            'counted_by'       => $this->counted_by,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
