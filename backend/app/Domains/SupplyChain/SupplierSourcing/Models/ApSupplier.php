<?php

namespace App\Domains\SupplyChain\SupplierSourcing\Models;

use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class ApSupplier extends Model
{
    use HasFactory;
    protected $fillable = [
        'supplier_code',
        'name',
        'phone',
        'email',
        'address',
        'tax_number',
        'credit_limit',
        'payment_terms',
        'current_balance',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'payment_terms' => 'integer',
            'current_balance' => 'decimal:2',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ApTransaction::class, 'supplier_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class, 'supplier_id');
    }
}
