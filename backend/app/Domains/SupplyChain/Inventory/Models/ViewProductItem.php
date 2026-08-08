<?php

namespace App\Domains\SupplyChain\Inventory\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Read-only Eloquent model for the v_product_items view.
 * Optimized for food/item catalog lookups, purchasing screens, and stock alerts.
 *
 * @property int         $product_id
 * @property string      $product_name
 * @property string|null $product_description
 * @property string      $item_type              product | service | raw_material
 * @property bool        $taxable
 * @property bool        $inventory_control
 * @property bool        $sellable
 * @property int|null    $category_id
 * @property string|null $category_name
 * @property string      $unit_name
 * @property string|null $sub_unit_name
 * @property int         $items_per_unit
 * @property float       $selling_price
 * @property float       $wac
 * @property float       $minimum_profit_margin
 * @property int         $low_stock_threshold
 * @property int         $stock_quantity
 * @property int         $needs_reorder          0 | 1
 * @property int         $in_stock               0 | 1
 * @property string|null $last_purchase_date
 * @property float|null  $last_purchase_price
 * @property int|null    $last_supplier_id
 * @property string|null $last_supplier_name
 * @property string|null $last_expiry_date
 * @property float       $costing_qty_available
 * @property float       $costing_inventory_value
 * @property int         $unsold_batch_count
 * @property string|null $earliest_expiry_date
 * @property int         $expiring_soon          0 | 1
 * @property float       $total_sold_qty
 * @property float       $total_revenue
 * @property int         $sales_invoice_count
 * @property int|null    $created_by
 * @property string|null $created_by_name
 * @property string|null $created_at
 * @property string|null $updated_at
 * @property int|null    $purchase_currency_id
 * @property string|null $purchase_currency_code
 */
class ViewProductItem extends Model
{
    protected $table      = 'v_product_items';
    protected $primaryKey = 'product_id';
    public $incrementing  = false;
    public $timestamps    = false;
    protected $guarded    = ['*'];

    protected $casts = [
        'product_id'              => 'integer',
        'taxable'                 => 'boolean',
        'inventory_control'       => 'boolean',
        'sellable'                => 'boolean',
        'category_id'             => 'integer',
        'items_per_unit'          => 'integer',
        'selling_price'           => 'decimal:2',
        'wac'                     => 'decimal:2',
        'minimum_profit_margin'   => 'decimal:2',
        'low_stock_threshold'     => 'integer',
        'stock_quantity'          => 'integer',
        'needs_reorder'           => 'boolean',
        'in_stock'                => 'boolean',
        'last_purchase_price'     => 'decimal:2',
        'last_supplier_id'        => 'integer',
        'costing_qty_available'   => 'decimal:4',
        'costing_inventory_value' => 'decimal:2',
        'unsold_batch_count'      => 'integer',
        'expiring_soon'           => 'boolean',
        'total_sold_qty'          => 'decimal:4',
        'total_revenue'           => 'decimal:2',
        'sales_invoice_count'     => 'integer',
        'created_by'              => 'integer',
        'purchase_currency_id'    => 'integer',
    ];

    // ── Scopes ───────────────────────────────────────────────────────────────

    /** Food / physical product items only */
    public function scopePhysicalProducts($query)
    {
        return $query->where('item_type', 'product');
    }

    /** Services only */
    public function scopeServices($query)
    {
        return $query->where('item_type', 'service');
    }

    /** Raw materials only */
    public function scopeRawMaterials($query)
    {
        return $query->where('item_type', 'raw_material');
    }

    /** Sellable items (products & services) */
    public function scopeSellable($query)
    {
        return $query->where('sellable', true);
    }

    /** Items with stock on hand */
    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    /** Items needing reorder (stock <= low_stock_threshold) */
    public function scopeNeedsReorder($query)
    {
        return $query->where('needs_reorder', 1);
    }

    /** Items with inventory batches expiring within 30 days (food safety) */
    public function scopeExpiringSoon($query)
    {
        return $query->where('expiring_soon', 1);
    }

    /** Filter by category */
    public function scopeForCategory($query, int $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /** Order by highest stock value */
    public function scopeOrderedByValue($query)
    {
        return $query->orderByDesc('costing_inventory_value');
    }
}