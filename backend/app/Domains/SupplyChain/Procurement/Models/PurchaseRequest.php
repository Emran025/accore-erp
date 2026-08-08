<?php

namespace App\Domains\SupplyChain\Procurement\Models;

use App\Domains\SupplyChain\Inventory\Models\Product;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class PurchaseRequest extends Model
{
    protected $fillable = [
        'product_id',
        'product_name',
        'quantity',
        'user_id',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
