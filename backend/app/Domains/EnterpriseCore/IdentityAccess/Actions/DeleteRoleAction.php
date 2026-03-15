<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;

class DeleteRoleAction
{
    public function execute(int $id): array
    {
        $role = Role::findOrFail($id);

        if ($role->is_system) {
            return ['success' => false, 'error' => 'Cannot delete system role', 'status' => 403];
        }

        if ($role->users()->exists()) {
            return ['success' => false, 'error' => 'Cannot delete role with assigned users', 'status' => 422];
        }

        $role->delete();

        return ['success' => true];
    }
}
