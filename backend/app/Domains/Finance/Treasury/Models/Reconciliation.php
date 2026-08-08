<?php

namespace App\Domains\Finance\Treasury\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use \App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;

class Reconciliation extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_code',
        'reconciliation_date',
        'ledger_balance',
        'physical_balance',
        'difference',
        'status',
        'notes',
        'adjustment_notes',
        'reconciled_by'
    ];

    protected $casts = [
        'reconciliation_date' => 'date',
        'ledger_balance' => 'decimal:2',
        'physical_balance' => 'decimal:2',
        'difference' => 'decimal:2',
    ];

    public function bankAccount(): BelongsTo
    {
        return $this->belongsTo(ChartOfAccount::class, 'account_code', 'account_code');
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }
}
