<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use App\Domains\EnterpriseCore\IdentityAccess\Models\RolePermission;

class ListRolesAction
{
    public function execute(array $filters = []): array
    {
        $action = $filters['action'] ?? null;

        if (!$action) {
            $roles = Role::select('id', 'role_name_ar as name', 'role_key')
                ->orderBy('role_name_ar')
                ->get();
            return ['key' => 'roles', 'data' => $roles];
        }

        if ($action === 'roles') {
            $roles = Role::orderBy('role_name_ar')->get();
            return ['key' => 'data', 'data' => $roles];
        }

        if ($action === 'modules') {
            $modules = Module::orderBy('category')->orderBy('sort_order')->get();
            $grouped = $modules->groupBy('category');
            return ['key' => 'data', 'data' => $grouped];
        }

        if ($action === 'role_permissions') {
            $roleId = $filters['role_id'] ?? null;
            $permissions = RolePermission::where('role_id', $roleId)
                ->join('modules', 'role_permissions.module_id', '=', 'modules.id')
                ->select('role_permissions.*', 'modules.module_key', 'modules.module_name_ar', 'modules.module_name_en')
                ->get();
            return ['key' => 'data', 'data' => $permissions];
        }

        return ['key' => 'error', 'data' => null, 'message' => 'Invalid action'];
    }
}
