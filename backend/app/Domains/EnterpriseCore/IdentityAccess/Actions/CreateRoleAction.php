<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\IdentityAccess\Models\RolePermission;
use Illuminate\Support\Str;

class CreateRoleAction
{
    public function execute(string $action, array $data): array
    {
        if ($action === 'update_permissions') {
            foreach ($data['permissions'] as $perm) {
                RolePermission::updateOrCreate(
                    ['role_id' => $data['role_id'], 'module_id' => $perm['module_id']],
                    [
                        'can_view'   => (bool) $perm['can_view'],
                        'can_create' => (bool) $perm['can_create'],
                        'can_edit'   => (bool) $perm['can_edit'],
                        'can_delete' => (bool) $perm['can_delete'],
                        'created_by' => auth()->id(),
                    ]
                );
            }

            return ['success' => true, 'message' => 'Permissions updated'];
        }

        // Default: Create role
        $role = Role::create([
            'role_key'     => Str::slug($data['name']),
            'role_name_ar' => $data['name'],
            'role_name_en' => $data['name'],
            'description'  => $data['description'] ?? null,
            'is_system'    => false,
            'is_active'    => true,
            'created_by'   => auth()->id(),
        ]);

        return ['success' => true, 'id' => $role->id, 'message' => 'Role created'];
    }
}
