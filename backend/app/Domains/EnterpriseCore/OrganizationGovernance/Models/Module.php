<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_key',
        'module_name_ar',
        'module_name_en',
        'category',
        'icon',
        'sort_order',
        'is_active',
        'readiness_requirements',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'readiness_requirements' => 'array',
        ];
    }

    public function permissions(): HasMany
    {
        return $this->hasMany(RolePermission::class);
    }
}
