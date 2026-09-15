<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Transitive closure model for sub-millisecond hierarchical graph traversals.
 *
 * @property int $id
 * @property string $plane_type
 * @property string $ancestor_uuid
 * @property string $descendant_uuid
 * @property int $depth
 * @property string|null $valid_from
 * @property string|null $valid_to
 */
class OrgNodeClosure extends Model
{
    use HasFactory;

    protected $table = 'org_node_closures';

    protected $fillable = [
        'plane_type',
        'ancestor_uuid',
        'descendant_uuid',
        'depth',
        'valid_from',
        'valid_to',
    ];

    protected $casts = [
        'depth' => 'integer',
        'valid_from' => 'date',
        'valid_to' => 'date',
    ];

    public function ancestor(): BelongsTo
    {
        return $this->belongsTo(StructureNode::class, 'ancestor_uuid', 'node_uuid');
    }

    public function descendant(): BelongsTo
    {
        return $this->belongsTo(StructureNode::class, 'descendant_uuid', 'node_uuid');
    }

    public function scopeActiveOnDate($query, ?string $date = null)
    {
        $targetDate = $date ?? now()->toDateString();

        return $query->where(function ($q) use ($targetDate) {
            $q->whereNull('valid_from')->orWhere('valid_from', '<=', $targetDate);
        })->where(function ($q) use ($targetDate) {
            $q->whereNull('valid_to')->orWhere('valid_to', '>=', $targetDate);
        });
    }

    public function scopePlane($query, string $planeType)
    {
        return $query->where('plane_type', $planeType);
    }
}
