<?php

namespace App\Http\Resources\Commercial\SalesLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API response shape for a service catalog item.
 */
class ServiceResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'item_type'             => $this->item_type,
            'taxable'               => (bool)$this->taxable,
            'inventory_control'     => false,
            'sellable'              => true,
            'name'                  => $this->name,
            'description'           => $this->description,
            'category_id'           => $this->category_id,
            'category_name'         => $this->category?->name,
            'unit_price'            => (float)$this->unit_price,
            'minimum_profit_margin' => (float)$this->minimum_profit_margin,
            'unit_name'             => $this->unit_name,
            'sub_unit_name'         => $this->sub_unit_name,
            'created_by'            => $this->created_by,
            'pos_availability'      => $this->whenLoaded('serviceAvailability', function () {
                return $this->serviceAvailability->map(fn($a) => [
                    'id'             => $a->id,
                    'pos_location'   => $a->pos_location,
                    'active'         => (bool)$a->active,
                    'effective_from' => $a->effective_from?->toDateString(),
                    'effective_to'   => $a->effective_to?->toDateString(),
                    'notes'          => $a->notes,
                ]);
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
