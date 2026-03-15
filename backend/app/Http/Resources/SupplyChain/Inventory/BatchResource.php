<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;

class BatchResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'batch_name'       => $this->batch_name,
            'batch_type'       => $this->batch_type,
            'description'      => $this->description ?? null,
            'status'           => $this->status,
            'total_items'      => (int) $this->total_items,
            'successful_items' => (int) $this->successful_items,
            'failed_items'     => (int) $this->failed_items,
            'created_by'       => $this->created_by,
            'completed_at'     => $this->completed_at?->toDateTimeString(),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'items'            => BatchItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
