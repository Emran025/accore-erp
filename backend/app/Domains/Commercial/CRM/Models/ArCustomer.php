<?php

namespace App\Domains\Commercial\CRM\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Scope;
use App\Domains\Commercial\CRM\Models\ArCustomer;
class ArCustomer extends Model
{
    use HasFactory;
    
    const CASH_CUSTOMER_CODE = 'CASH-001';

    protected static function booted()
    {
        static::addGlobalScope('hide_cash_customer', new class implements Scope {
            public function apply(Builder $builder, Model $model)
            {
                $builder->where('customer_code', '!=', ArCustomer::CASH_CUSTOMER_CODE);
            }
        });
    }

    protected $fillable = [
        'customer_code',
        'name',
        'phone',
        'email',
        'address',
        'tax_number',
        'current_balance',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'current_balance' => 'decimal:2',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(ArTransaction::class, 'customer_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }
}
