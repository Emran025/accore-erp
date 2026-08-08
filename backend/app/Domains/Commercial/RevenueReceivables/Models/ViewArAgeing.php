<?php
namespace App\Domains\Commercial\RevenueReceivables\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_ar_ageing view.
 * Customer open balances pre-bucketed into ageing bands (0-30, 31-60, 61-90, 90+).
 *
 * @property int         $customer_id
 * @property string      $customer_name
 * @property string|null $customer_phone
 * @property string|null $tax_number
 * @property float       $ledger_balance
 * @property float       $transaction_amount
 * @property string      $transaction_type
 * @property string      $transaction_date
 * @property string|null $voucher_number
 * @property string|null $reference_type
 * @property int|null    $reference_id
 * @property int         $days_outstanding
 * @property string      $ageing_bucket   0-30 | 31-60 | 61-90 | 90+
 */
class ViewArAgeing extends Model
{
    protected $table    = 'v_ar_ageing';
    protected $primaryKey = null;
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'customer_id'        => 'integer',
        'ledger_balance'     => 'decimal:2',
        'transaction_amount' => 'decimal:2',
        'days_outstanding'   => 'integer',
        'reference_id'       => 'integer',
    ];
    public function scopeForCustomer($query, int $customerId) { return $query->where('customer_id', $customerId); }
    public function scopeInBucket($query, string $bucket) { return $query->where('ageing_bucket', $bucket); }
    public function scopeOverdue($query) { return $query->where('days_outstanding', '>', 0); }
    public function scopeGroupedByCustomer($query) {
        return $query->selectRaw('customer_id, customer_name, customer_phone, tax_number, ledger_balance,
            SUM(CASE WHEN ageing_bucket = "0-30"  THEN transaction_amount ELSE 0 END) AS bucket_0_30,
            SUM(CASE WHEN ageing_bucket = "31-60" THEN transaction_amount ELSE 0 END) AS bucket_31_60,
            SUM(CASE WHEN ageing_bucket = "61-90" THEN transaction_amount ELSE 0 END) AS bucket_61_90,
            SUM(CASE WHEN ageing_bucket = "90+"   THEN transaction_amount ELSE 0 END) AS bucket_90plus,
            SUM(transaction_amount) AS total_outstanding')
            ->groupBy('customer_id', 'customer_name', 'customer_phone', 'tax_number', 'ledger_balance');
    }
}