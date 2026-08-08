<?php
namespace App\Domains\SupplyChain\PayablesExpenses\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_ap_ageing view.
 * Supplier open balances pre-bucketed into ageing bands, with overdue days
 * calculated against each supplier payment terms.
 *
 * @property int         $supplier_id
 * @property string      $supplier_name
 * @property string|null $supplier_phone
 * @property string|null $tax_number
 * @property float       $ledger_balance
 * @property float       $credit_limit
 * @property int         $payment_terms
 * @property float       $transaction_amount
 * @property string      $transaction_type
 * @property string      $transaction_date
 * @property string|null $voucher_number
 * @property string|null $reference_type
 * @property int|null    $reference_id
 * @property int         $days_outstanding
 * @property string      $ageing_bucket    0-30 | 31-60 | 61-90 | 90+
 * @property int         $days_overdue
 */
class ViewApAgeing extends Model
{
    protected $table    = 'v_ap_ageing';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'supplier_id'        => 'integer',
        'ledger_balance'     => 'decimal:2',
        'credit_limit'       => 'decimal:2',
        'payment_terms'      => 'integer',
        'transaction_amount' => 'decimal:2',
        'days_outstanding'   => 'integer',
        'days_overdue'       => 'integer',
        'reference_id'       => 'integer',
    ];
    public function scopeForSupplier($query, int $supplierId) { return $query->where('supplier_id', $supplierId); }
    public function scopeInBucket($query, string $bucket) { return $query->where('ageing_bucket', $bucket); }
    public function scopeOverdue($query) { return $query->where('days_overdue', '>', 0); }
    public function scopeGroupedBySupplier($query) {
        return $query->selectRaw('supplier_id, supplier_name, supplier_phone, tax_number, ledger_balance,
            credit_limit, payment_terms,
            SUM(CASE WHEN ageing_bucket = "0-30"  THEN transaction_amount ELSE 0 END) AS bucket_0_30,
            SUM(CASE WHEN ageing_bucket = "31-60" THEN transaction_amount ELSE 0 END) AS bucket_31_60,
            SUM(CASE WHEN ageing_bucket = "61-90" THEN transaction_amount ELSE 0 END) AS bucket_61_90,
            SUM(CASE WHEN ageing_bucket = "90+"   THEN transaction_amount ELSE 0 END) AS bucket_90plus,
            SUM(transaction_amount) AS total_outstanding,
            MAX(days_overdue) AS max_days_overdue')
            ->groupBy('supplier_id', 'supplier_name', 'supplier_phone', 'tax_number', 'ledger_balance', 'credit_limit', 'payment_terms');
    }
}