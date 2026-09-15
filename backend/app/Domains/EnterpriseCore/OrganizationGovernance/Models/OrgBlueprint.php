<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Intermediate staged blueprint representation of an organizational architecture.
 *
 * @property int $id
 * @property string $blueprint_uuid
 * @property string $name
 * @property string $status staged | validated | published | archived
 * @property int $complexity_grade 1 to 5
 * @property string $primary_archetype
 * @property array $blueprint_json
 * @property int|null $created_by
 * @property \Carbon\Carbon|null $published_at
 */
class OrgBlueprint extends Model
{
    use HasFactory;

    protected $table = 'org_blueprints';

    protected $fillable = [
        'blueprint_uuid',
        'name',
        'status',
        'complexity_grade',
        'primary_archetype',
        'blueprint_json',
        'created_by',
        'published_at',
    ];

    protected $casts = [
        'complexity_grade' => 'integer',
        'blueprint_json' => 'array',
        'published_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeStaged($query)
    {
        return $query->where('status', 'staged');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
