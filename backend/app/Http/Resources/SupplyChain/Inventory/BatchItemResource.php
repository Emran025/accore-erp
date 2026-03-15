<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;

class BatchItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'         => $this->id,
            'batch_id'   => $this->batch_id,
            'item_type'  => $this->item_type ?? null,
            'item_id'    => $this->item_id ?? null,
            'status'     => $this->status ?? null,
            'error'      => $this->error ?? null,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
