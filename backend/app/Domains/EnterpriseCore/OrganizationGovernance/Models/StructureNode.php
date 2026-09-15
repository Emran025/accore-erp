<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * Polymorphic structure node: All organizational units (Company Code, Plant, etc.)
 * stored in a single table. SAP-style: no separate T001/T001W tables.
 */
class StructureNode extends Model
{
    protected $table = 'structure_nodes';

    protected $primaryKey = 'node_uuid';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'node_uuid',
        'legal_entity_uuid',
        'node_type_id',
        'code',
        'name_en',
        'name_ar',
        'attributes_json',
        'facets_json',
        'status',
        'is_locked',
        'valid_from',
        'valid_to',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'attributes_json' => 'array',
            'facets_json' => 'array',
            'is_locked' => 'boolean',
            'valid_from' => 'date',
            'valid_to' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (StructureNode $node) {
            if (empty($node->node_uuid)) {
                $node->node_uuid = (string) Str::uuid();
            }
        });
    }

    public function metaType(): BelongsTo
    {
        return $this->belongsTo(OrgMetaType::class, 'node_type_id', 'id');
    }

    public function outgoingLinks(): HasMany
    {
        return $this->hasMany(StructureLink::class, 'source_node_uuid', 'node_uuid');
    }

    public function incomingLinks(): HasMany
    {
        return $this->hasMany(StructureLink::class, 'target_node_uuid', 'node_uuid');
    }

    public function targets(): HasMany
    {
        return $this->outgoingLinks();
    }

    public function sources(): HasMany
    {
        return $this->incomingLinks();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function legalEntity(): BelongsTo
    {
        return $this->belongsTo(self::class, 'legal_entity_uuid', 'node_uuid');
    }

    public function ancestorClosures(): HasMany
    {
        return $this->hasMany(OrgNodeClosure::class, 'descendant_uuid', 'node_uuid');
    }

    public function descendantClosures(): HasMany
    {
        return $this->hasMany(OrgNodeClosure::class, 'ancestor_uuid', 'node_uuid');
    }

    public function hasFacet(string $facet): bool
    {
        return in_array($facet, $this->facets_json ?? [], true);
    }

    public function displayName(string $locale = 'ar-SA'): string
    {
        if ($locale === 'ar-SA' && filled($this->name_ar)) {
            return $this->name_ar;
        }

        if (filled($this->name_en)) {
            return $this->name_en;
        }

        $attrName = $this->getOrgAttribute('name');
        if (filled($attrName)) {
            return (string) $attrName;
        }

        return $this->code;
    }

    public function getOrgAttribute(string $key, $default = null)
    {
        $attrs = $this->attributes_json ?? [];
        return data_get($attrs, $key, $default);
    }
}
