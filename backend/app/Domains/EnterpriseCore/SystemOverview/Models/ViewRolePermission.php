<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Read-only Eloquent model for the v_role_permissions view.
 * Flattened role x module permission matrix for ultra-fast auth checks and UI grid.
 *
 * @property int         $permission_id
 * @property int         $role_id
 * @property string      $role_key
 * @property string      $role_name_ar
 * @property string      $role_name_en
 * @property bool        $role_is_system
 * @property bool        $role_is_active
 * @property int         $module_id
 * @property string      $module_key
 * @property string      $module_name_ar
 * @property string      $module_name_en
 * @property string|null $module_category
 * @property string|null $module_icon
 * @property int         $module_sort_order
 * @property bool        $module_is_active
 * @property bool        $can_view
 * @property bool        $can_create
 * @property bool        $can_edit
 * @property bool        $can_delete
 * @property bool        $has_any_access
 * @property bool        $has_full_access
 * @property string|null $created_at
 * @property string|null $updated_at
 */
class ViewRolePermission extends Model
{
    protected $table      = 'v_role_permissions';
    protected $primaryKey = 'permission_id';
    public $incrementing  = false;
    public $timestamps    = false;
    protected $guarded    = ['*'];

    protected $casts = [
        'permission_id'     => 'integer',
        'role_id'           => 'integer',
        'role_is_system'    => 'boolean',
        'role_is_active'    => 'boolean',
        'module_id'         => 'integer',
        'module_sort_order' => 'integer',
        'module_is_active'  => 'boolean',
        'can_view'          => 'boolean',
        'can_create'        => 'boolean',
        'can_edit'          => 'boolean',
        'can_delete'        => 'boolean',
        'has_any_access'    => 'boolean',
        'has_full_access'   => 'boolean',
    ];

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeForRole($query, int $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    public function scopeForRoleKey($query, string $roleKey)
    {
        return $query->where('role_key', $roleKey);
    }

    public function scopeForModuleKey($query, string $moduleKey)
    {
        return $query->where('module_key', $moduleKey);
    }

    public function scopeCanView($query)
    {
        return $query->where('can_view', true);
    }

    public function scopeCanCreate($query)
    {
        return $query->where('can_create', true);
    }

    public function scopeCanEdit($query)
    {
        return $query->where('can_edit', true);
    }

    public function scopeCanDelete($query)
    {
        return $query->where('can_delete', true);
    }

    public function scopeForCategory($query, string $category)
    {
        return $query->where('module_category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('module_sort_order');
    }
}