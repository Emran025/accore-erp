<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\IdentityAccess\Models\RolePermission;
use Illuminate\Support\Str;

use Illuminate\Support\Collection;

class CreateRoleAction
{
    /**
     * Create role or update its permissions.
     */
    public function execute(string $action, array $data): Role|Collection
    {
        if ($action === 'update_permissions') {
            foreach ($data['permissions'] as $perm) {
                RolePermission::updateOrCreate(
                    ['role_id' => $data['role_id'], 'module_id' => $perm['module_id']],
                    [
                        'can_view'   => (bool) ($perm['can_view'] ?? false),
                        'can_create' => (bool) ($perm['can_create'] ?? false),
                        'can_edit'   => (bool) ($perm['can_edit'] ?? false),
                        'can_delete' => (bool) ($perm['can_delete'] ?? false),
                        'created_by' => auth()->id(),
                    ]
                );
            }

            return collect(['success' => true, 'message' => 'Permissions updated']);
        }

        // Default: Create role
        return Role::create([
            'role_key'     => Str::slug($data['name']),
            'role_name_ar' => $data['name'],
            'role_name_en' => $data['name'],
            'description'  => $data['description'] ?? null,
            'is_system'    => false,
            'is_active'    => true,
            'created_by'   => auth()->id(),
        ]);
    }
}
