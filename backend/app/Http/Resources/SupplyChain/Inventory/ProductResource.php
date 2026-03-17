<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                      => $this->id,
            'item_type'               => $this->item_type ?? 'product',
            'taxable'                 => (bool)($this->taxable ?? true),
            'inventory_control'       => (bool)($this->inventory_control ?? true),
            'sellable'                => (bool)($this->sellable ?? true),
            'name'                    => $this->name,
            'description'             => $this->description,
            'category_id'             => $this->category_id,
            'category_name'           => $this->category?->name,
            'unit_price'              => (float) $this->unit_price,
            'minimum_profit_margin'   => (float) $this->minimum_profit_margin,
            'stock_quantity'          => (int) $this->stock_quantity,
            'low_stock_threshold'     => (int) ($this->low_stock_threshold ?? 0),
            'unit_name'               => $this->unit_name,
            'items_per_unit'          => (int) ($this->items_per_unit ?? 1),
            'sub_unit_name'           => $this->sub_unit_name,
            'weighted_average_cost'   => (float) $this->weighted_average_cost,
            'purchase_currency_id'    => $this->purchase_currency_id,
            'created_by'              => $this->created_by,
            'created_at'              => $this->created_at?->toDateTimeString(),
            'updated_at'              => $this->updated_at?->toDateTimeString(),
        ];
    }
}
