<?php
namespace App\Domains\SupplyChain\Procurement\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_purchase_summary view.
 * Pre-joined purchase header with product, supplier, user, approver,
 * GL totals, and tax line totals. Use for purchase list pages and reports.
 *
 * @property int         $purchase_id
 * @property string|null $voucher_number
 * @property string      $purchase_date
 * @property string      $payment_type
 * @property string      $approval_status
 * @property bool        $is_reversed
 * @property string|null $reversed_at
 * @property string      $created_at
 * @property int         $quantity
 * @property string      $unit_type
 * @property float       $invoice_price
 * @property string|null $production_date
 * @property string|null $expiry_date
 * @property string|null $notes
 * @property int         $product_id
 * @property string      $product_name
 * @property string      $unit_name
 * @property string|null $sub_unit_name
 * @property int         $current_stock
 * @property float       $weighted_average_cost
 * @property int|null    $supplier_id
 * @property string|null $supplier_name
 * @property string|null $supplier_phone
 * @property float       $supplier_balance
 * @property int|null    $user_id
 * @property string|null $created_by_name
 * @property int|null    $approved_by
 * @property string|null $approved_by_name
 * @property string|null $approved_at
 * @property float       $gl_debit_total
 * @property float       $gl_credit_total
 * @property float       $tax_total
 * @property float       $taxable_amount
 */
class ViewPurchaseSummary extends Model
{
    protected $table    = 'v_purchase_summary';
    protected $primaryKey = 'purchase_id';
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'purchase_id'          => 'integer',
        'is_reversed'          => 'boolean',
        'quantity'             => 'integer',
        'invoice_price'        => 'decimal:2',
        'product_id'           => 'integer',
        'current_stock'        => 'integer',
        'weighted_average_cost'=> 'decimal:2',
        'supplier_id'          => 'integer',
        'supplier_balance'     => 'decimal:2',
        'user_id'              => 'integer',
        'approved_by'          => 'integer',
        'gl_debit_total'       => 'decimal:2',
        'gl_credit_total'      => 'decimal:2',
        'tax_total'            => 'decimal:4',
        'taxable_amount'       => 'decimal:4',
    ];
    public function scopeForSupplier($query, int $supplierId) { return $query->where('supplier_id', $supplierId); }
    public function scopeForProduct($query, int $productId) { return $query->where('product_id', $productId); }
    public function scopePending($query) { return $query->where('approval_status', 'pending'); }
    public function scopeApproved($query) { return $query->where('approval_status', 'approved'); }
    public function scopeActive($query) { return $query->where('is_reversed', false); }
    public function scopeDateBetween($query, string $from, string $to) {
        return $query->whereBetween('purchase_date', [$from, $to]);
    }
    public function scopeLatest($query) { return $query->orderByDesc('purchase_date'); }
}