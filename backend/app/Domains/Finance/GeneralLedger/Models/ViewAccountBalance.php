<?php
namespace App\Domains\Finance\GeneralLedger\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_account_balances view.
 * Single-pass aggregation of open GL entries by account, period, and entry type.
 * Use instead of per-account SUM loops in PHP.
 *
 * @property int         $account_id
 * @property int|null    $fiscal_period_id
 * @property string      $account_code
 * @property string      $account_name
 * @property string      $account_type
 * @property int|null    $parent_id
 * @property string      $entry_type
 * @property float       $total_amount
 * @property int         $entry_count
 * @property string|null $first_entry_date
 * @property string|null $last_entry_date
 */
class ViewAccountBalance extends Model
{
    protected $table = 'v_account_balances';
    public $incrementing = false;
    public $timestamps   = false;
    protected $primaryKey = null;
    protected $guarded    = ['*'];
    protected $casts = [
        'account_id'       => 'integer',
        'fiscal_period_id' => 'integer',
        'parent_id'        => 'integer',
        'total_amount'     => 'decimal:2',
        'entry_count'      => 'integer',
    ];
    public function scopeForAccount($query, int $accountId) { return $query->where('account_id', $accountId); }
    public function scopeForPeriod($query, int $fiscalPeriodId) { return $query->where('fiscal_period_id', $fiscalPeriodId); }
    public function scopeDebits($query) { return $query->where('entry_type', 'DEBIT'); }
    public function scopeCredits($query) { return $query->where('entry_type', 'CREDIT'); }
    public function scopeOfType($query, string $accountType) { return $query->where('account_type', $accountType); }
}