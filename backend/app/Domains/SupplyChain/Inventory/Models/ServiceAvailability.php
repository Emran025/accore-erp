<?php

namespace App\Domains\SupplyChain\Inventory\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

/**
 * Maps a service item to a point-of-sale location.
 * Services have no physical stock; this record indicates that a service
 * is "available" at a given POS (as opposed to warehouse stock transfer).
 *
 * @property int    $id
 * @property int    $service_id    FK → products (item_type = 'service')
 * @property string $pos_location  POS identifier (branch code, counter name, etc.)
 * @property bool   $active
 * @property string|null $effective_from
 * @property string|null $effective_to
 * @property string|null $notes
 * @property int|null    $created_by
 */
class ServiceAvailability extends Model
{
    protected $table = 'service_availability';

    protected $fillable = [
        'service_id',
        'pos_location',
        'active',
        'effective_from',
        'effective_to',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'active'         => 'boolean',
        'effective_from' => 'date',
        'effective_to'   => 'date',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'service_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
