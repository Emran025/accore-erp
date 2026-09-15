<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Association matrix: Links between structure nodes.
 * Validated against TopologyRulesMatrix before insert.
 */
class StructureLink extends Model
{
    protected $table = 'structure_links';

    protected $fillable = [
        'source_node_uuid',
        'target_node_uuid',
        'topology_rule_id',
        'link_type',
        'plane_type',
        'priority',
        'weight',
        'valid_from',
        'valid_to',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'valid_from' => 'date',
            'valid_to' => 'date',
            'priority' => 'integer',
            'weight' => 'decimal:2',
        ];
    }

    public function scopePlane($query, string $planeType)
    {
        return $query->where('plane_type', $planeType);
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

    public function sourceNode(): BelongsTo
    {
        return $this->belongsTo(StructureNode::class, 'source_node_uuid', 'node_uuid');
    }

    public function targetNode(): BelongsTo
    {
        return $this->belongsTo(StructureNode::class, 'target_node_uuid', 'node_uuid');
    }

    public function topologyRule(): BelongsTo
    {
        return $this->belongsTo(TopologyRule::class);
    }

    public function isActive(): bool
    {
        $today = now()->startOfDay();

        return ($this->valid_from === null || $this->valid_from->lte($today))
            && ($this->valid_to === null || $this->valid_to->gte($today));
    }
}
