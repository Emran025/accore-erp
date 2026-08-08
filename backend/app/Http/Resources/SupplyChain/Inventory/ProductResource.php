<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        $unitPrice = (float) ($this->selling_price ?? $this->unit_price ?? 0);
        $stockQty  = (int) ($this->stock_quantity ?? 0);
        $minStock  = (int) ($this->low_stock_threshold ?? 0);
        $creator   = $this->created_by_name ?? $this->createdBy?->full_name;

        return [
            // Core identity
            'id'                      => $this->product_id ?? $this->id,
            'item_type'               => $this->item_type ?? 'product',
            'taxable'                 => (bool)($this->taxable ?? true),
            'inventory_control'       => (bool)($this->inventory_control ?? true),
            'sellable'                => (bool)($this->sellable ?? true),
            'name'                    => $this->product_name ?? $this->name,
            'description'             => $this->product_description ?? $this->description,

            // Category
            'category_id'             => $this->category_id,
            'category_name'           => $this->category_name ?? $this->category?->name,

            // Pricing & Margins
            'unit_price'              => $unitPrice,
            'selling_price'           => $unitPrice, // Frontend interface alias
            'minimum_profit_margin'   => (float) ($this->minimum_profit_margin ?? 0),
            'profit_margin'           => (float) ($this->minimum_profit_margin ?? 0), // Frontend interface alias
            'weighted_average_cost'   => (float) ($this->wac ?? $this->weighted_average_cost ?? 0),
            'latest_purchase_price'   => (float) ($this->last_purchase_price ?? $this->weighted_average_cost ?? 0),

            // Stock & Inventory
            'stock_quantity'          => $stockQty,
            'stock'                   => $stockQty, // Frontend interface alias
            'low_stock_threshold'     => $minStock,
            'min_stock'               => $minStock, // Frontend interface alias
            'needs_reorder'           => (bool) ($this->needs_reorder ?? false),
            'expiring_soon'           => (bool) ($this->expiring_soon ?? false),
            'earliest_expiry_date'    => $this->earliest_expiry_date ?? $this->last_expiry_date,

            // Units & Packaging
            'unit_name'               => $this->unit_name,
            'unit_type'               => $this->unit_name, // Frontend interface alias
            'items_per_unit'          => (int) ($this->items_per_unit ?? 1),
            'sub_unit_name'           => $this->sub_unit_name,

            // Currency & Audit
            'purchase_currency_id'    => $this->purchase_currency_id,
            'purchase_currency_code'  => $this->purchase_currency_code,
            'created_by'              => $this->created_by,
            'created_by_name'         => $creator,
            'creator_name'            => $creator, // Frontend interface alias
            'created_at'              => is_string($this->created_at) ? $this->created_at : $this->created_at?->toDateTimeString(),
            'updated_at'              => is_string($this->updated_at) ? $this->updated_at : $this->updated_at?->toDateTimeString(),
        ];
    }
}


