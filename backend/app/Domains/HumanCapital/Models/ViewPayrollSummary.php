<?php
namespace App\Domains\HumanCapital\Models;
use Illuminate\Database\Eloquent\Model;
/**
 * Read-only Eloquent model for the v_payroll_summary view.
 * Per-cycle payroll summary with employee count and item-level aggregates.
 * Use for the payroll dashboard and cycle list pages.
 *
 * @property int         $cycle_id
 * @property string      $cycle_name
 * @property string      $cycle_type
 * @property string      $period_start
 * @property string      $period_end
 * @property string      $payment_date
 * @property string      $status
 * @property float       $total_gross
 * @property float       $total_deductions
 * @property float       $total_net
 * @property string|null $approved_at
 * @property string      $created_at
 * @property int|null    $approved_by
 * @property string|null $approved_by_name
 * @property int|null    $created_by
 * @property string|null $created_by_name
 * @property int         $employee_count
 * @property int         $active_item_count
 * @property int         $on_hold_item_count
 * @property float       $computed_gross
 * @property float       $computed_deductions
 * @property float       $computed_net
 * @property float       $computed_allowances
 */
class ViewPayrollSummary extends Model
{
    protected $table    = 'v_payroll_summary';
    protected $primaryKey = 'cycle_id';
    public $incrementing = false;
    public $timestamps   = false;
    protected $guarded   = ['*'];
    protected $casts = [
        'cycle_id'           => 'integer',
        'total_gross'        => 'decimal:2',
        'total_deductions'   => 'decimal:2',
        'total_net'          => 'decimal:2',
        'approved_by'        => 'integer',
        'created_by'         => 'integer',
        'employee_count'     => 'integer',
        'active_item_count'  => 'integer',
        'on_hold_item_count' => 'integer',
        'computed_gross'     => 'decimal:2',
        'computed_deductions'=> 'decimal:2',
        'computed_net'       => 'decimal:2',
        'computed_allowances'=> 'decimal:2',
    ];
    public function scopeWithStatus($query, string $status) { return $query->where('status', $status); }
    public function scopeDraft($query) { return $query->where('status', 'draft'); }
    public function scopePendingApproval($query) { return $query->where('status', 'pending_approval'); }
    public function scopeApproved($query) { return $query->where('status', 'approved'); }
    public function scopePaid($query) { return $query->where('status', 'paid'); }
    public function scopeForType($query, string $cycleType) { return $query->where('cycle_type', $cycleType); }
    public function scopeLatest($query) { return $query->orderByDesc('period_start'); }
}