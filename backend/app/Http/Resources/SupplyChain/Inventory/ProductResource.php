<?php

namespace App\Http\Resources\SupplyChain\Inventory;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Localization\LocalizedValue;

class ProductResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        $unitPrice = (float) ($this->selling_price ?? $this->unit_price ?? 0);
        $costPrice = (float) ($this->wac ?? $this->weighted_average_cost ?? 0);
        $stockQty  = (int) ($this->stock_quantity ?? 0);
        $minStock  = (int) ($this->low_stock_threshold ?? 0);
        $creator   = $this->created_by_name ?? $this->createdBy?->full_name;
        $nameTranslations = LocalizedValue::translations($this->resource, 'name');
        $descriptionTranslations = LocalizedValue::translations($this->resource, 'description');
        $unitTranslations = LocalizedValue::translations($this->resource, 'unit_name');
        $subUnitTranslations = LocalizedValue::translations($this->resource, 'sub_unit_name');

        return [
            // Core identity
            'id'                      => $this->product_id ?? $this->id,
            'item_type'               => $this->item_type ?? 'product',
            'taxable'                 => (bool)($this->taxable ?? true),
            'inventory_control'       => (bool)($this->inventory_control ?? true),
            'sellable'                => (bool)($this->sellable ?? true),
            'catalog_code'             => $this->catalog_code,
            'barcode'                  => $this->catalog_code,
            'name'                    => LocalizedValue::resolve($this->resource, 'name') ?? ($this->product_name ?? $this->name),
            'name_ar'                 => $nameTranslations['ar'],
            'name_en'                 => $nameTranslations['en'],
            'name_translations'       => $nameTranslations,
            'description'             => LocalizedValue::resolve($this->resource, 'description') ?? ($this->product_description ?? $this->description),
            'description_ar'         => $descriptionTranslations['ar'],
            'description_en'         => $descriptionTranslations['en'],
            'description_translations' => $descriptionTranslations,

            // Category
            'category_id'             => $this->category_id,
            'category_name'           => $this->category?->localized('name') ?? $this->category_name,
            'category_name_ar'        => $this->category?->localized('name', 'ar'),
            'category_name_en'        => $this->category?->localized('name', 'en'),

            // Pricing & Margins
            'unit_price'              => $unitPrice,
            'selling_price'           => $unitPrice, // Frontend interface alias
            'minimum_profit_margin'   => (float) ($this->minimum_profit_margin ?? 0),
            'profit_margin'           => (float) ($this->minimum_profit_margin ?? 0), // Frontend interface alias
            'weighted_average_cost'   => $costPrice,
            'cost_price'              => $costPrice,
            'purchase_price'          => $costPrice,
            'latest_purchase_price'   => (float) ($this->last_purchase_price ?? $costPrice),

            // Stock & Inventory
            'stock_quantity'          => $stockQty,
            'stock'                   => $stockQty, // Frontend interface alias
            'low_stock_threshold'     => $minStock,
            'min_stock'               => $minStock, // Frontend interface alias
            'needs_reorder'           => (bool) ($this->needs_reorder ?? false),
            'expiring_soon'           => (bool) ($this->expiring_soon ?? false),
            'earliest_expiry_date'    => $this->earliest_expiry_date ?? $this->last_expiry_date,

            // Units & Packaging
            'unit_name'               => LocalizedValue::resolve($this->resource, 'unit_name'),
            'unit_name_ar'            => $unitTranslations['ar'],
            'unit_name_en'            => $unitTranslations['en'],
            'unit_name_translations'  => $unitTranslations,
            'unit_type'               => LocalizedValue::resolve($this->resource, 'unit_name'), // Frontend interface alias
            'items_per_unit'          => (int) ($this->items_per_unit ?? 1),
            'sub_unit_name'           => LocalizedValue::resolve($this->resource, 'sub_unit_name'),
            'sub_unit_name_ar'        => $subUnitTranslations['ar'],
            'sub_unit_name_en'        => $subUnitTranslations['en'],
            'sub_unit_name_translations' => $subUnitTranslations,

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

