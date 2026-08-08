<?php
namespace App\Domains\Finance\GeneralLedger\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_trial_balance view.
 * Pivots v_account_balances into debit_total / credit_total / net_balance
 * per account per fiscal period, respecting normal balance rules.
 *
 * @property int    $account_id
 * @property int    $fiscal_period_id
 * @property string $account_code
 * @property string $account_name
 * @property string $account_type
 * @property int    $parent_id
 * @property float  $debit_total
 * @property float  $credit_total
 * @property float  $net_balance
 */
class ViewTrialBalance extends Model
{
    protected $table = 'v_trial_balance';
    public $incrementing = false;
    public $timestamps   = false;
    protected $primaryKey = null;
    protected $guarded    = ['*'];
    protected $casts = [
        'account_id'       => 'integer',
        'fiscal_period_id' => 'integer',
        'parent_id'        => 'integer',
        'debit_total'      => 'decimal:2',
        'credit_total'     => 'decimal:2',
        'net_balance'      => 'decimal:2',
    ];
    public function scopeForPeriod($query, int $fiscalPeriodId) { return $query->where('fiscal_period_id', $fiscalPeriodId); }
    public function scopeWithActivity($query) { return $query->where(function ($q) { $q->where('debit_total', '>', 0)->orWhere('credit_total', '>', 0); }); }
    public function scopeOfType($query, string $type) { return $query->where('account_type', $type); }
    public function scopeOrdered($query) { return $query->orderBy('account_code'); }
}