<?php

namespace App\Domains\SupplyChain\Inventory\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImportBatch extends Model
{
    protected $table = 'product_import_batches';

    protected $fillable = [
        'batch_id',
        'source_file',
        'status',
        'row_count',
        'approval_field_ids',
        'product_ids',
        'created_by',
        'committed_at',
        'failure_reason',
    ];

    protected $casts = [
        'approval_field_ids' => 'array',
        'product_ids' => 'array',
        'committed_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeCommitted(Builder $query): Builder
    {
        return $query->where('status', 'committed');
    }
}
