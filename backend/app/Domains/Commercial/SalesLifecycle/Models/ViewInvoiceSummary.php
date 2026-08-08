<?php
namespace App\Domains\Commercial\SalesLifecycle\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_invoice_summary view.
 * Provides pre-joined invoice header with customer info, GL totals,
 * tax totals, and item count. Use for invoice list pages and reports.
 *
 * @property int         $invoice_id
 * @property string      $invoice_number
 * @property string|null $voucher_number
 * @property string      $payment_type
 * @property bool        $is_reversed
 * @property string|null $reversed_at
 * @property string      $created_at
 * @property string      $updated_at
 * @property int|null    $customer_id
 * @property string|null $customer_name
 * @property string|null $customer_phone
 * @property float       $customer_balance
 * @property int|null    $user_id
 * @property string|null $created_by_name
 * @property int|null    $sales_representative_id
 * @property string|null $sales_rep_name
 * @property float       $gl_debit_total
 * @property float       $gl_credit_total
 * @property float       $tax_total
 * @property float       $taxable_amount
 * @property int         $item_count
 * @property float       $items_subtotal
 */
class ViewInvoiceSummary extends Model
{
    protected $table    = 'v_invoice_summary';
    protected $primaryKey = 'invoice_id';
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'invoice_id'              => 'integer',
        'is_reversed'             => 'boolean',
        'customer_id'             => 'integer',
        'user_id'                 => 'integer',
        'sales_representative_id' => 'integer',
        'gl_debit_total'          => 'decimal:2',
        'gl_credit_total'         => 'decimal:2',
        'tax_total'               => 'decimal:4',
        'taxable_amount'          => 'decimal:4',
        'item_count'              => 'integer',
        'items_subtotal'          => 'decimal:2',
        'customer_balance'        => 'decimal:2',
    ];
    public function scopeForCustomer($query, int $customerId) { return $query->where('customer_id', $customerId); }
    public function scopeActive($query) { return $query->where('is_reversed', false); }
    public function scopeCash($query) { return $query->where('payment_type', 'cash'); }
    public function scopeCredit($query) { return $query->where('payment_type', 'credit'); }
    public function scopeLatest($query) { return $query->orderByDesc('created_at'); }
    public function scopeDateBetween($query, string $from, string $to) {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}