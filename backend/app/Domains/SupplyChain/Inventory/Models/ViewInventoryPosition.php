<?php
namespace App\Domains\SupplyChain\Inventory\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_inventory_position view.
 * Real-time stock position per product: quantity on hand (from products table),
 * total inventory value from costing batches, all-time COGS, WAC, reorder alert.
 *
 * @property int         $product_id
 * @property string      $product_name
 * @property string      $unit_name
 * @property string|null $sub_unit_name
 * @property int         $items_per_unit
 * @property int         $stock_quantity
 * @property float       $weighted_average_cost
 * @property float       $selling_price
 * @property float       $minimum_profit_margin
 * @property int|null    $reorder_level
 * @property int|null    $category_id
 * @property string|null $category_name
 * @property float       $costing_qty_available
 * @property float       $total_inventory_value
 * @property int         $unsold_batch_count
 * @property float       $total_consumed_qty
 * @property float       $total_cogs
 * @property int         $needs_reorder         0 | 1
 * @property float|null  $gross_margin_pct
 */
class ViewInventoryPosition extends Model
{
    protected $table    = 'v_inventory_position';
    protected $primaryKey = 'product_id';
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'product_id'            => 'integer',
        'items_per_unit'        => 'integer',
        'stock_quantity'        => 'integer',
        'weighted_average_cost' => 'decimal:2',
        'selling_price'         => 'decimal:2',
        'minimum_profit_margin' => 'decimal:2',
        'reorder_level'         => 'integer',
        'category_id'           => 'integer',
        'costing_qty_available' => 'decimal:4',
        'total_inventory_value' => 'decimal:2',
        'unsold_batch_count'    => 'integer',
        'total_consumed_qty'    => 'decimal:4',
        'total_cogs'            => 'decimal:2',
        'needs_reorder'         => 'boolean',
        'gross_margin_pct'      => 'decimal:2',
    ];
    public function scopeNeedsReorder($query) { return $query->where('needs_reorder', 1); }
    public function scopeForCategory($query, int $categoryId) { return $query->where('category_id', $categoryId); }
    public function scopeInStock($query) { return $query->where('stock_quantity', '>', 0); }
    public function scopeOutOfStock($query) { return $query->where('stock_quantity', '<=', 0); }
    public function scopeOrderedByValue($query) { return $query->orderByDesc('total_inventory_value'); }
    public function scopeOrderedByName($query) { return $query->orderBy('product_name'); }
}