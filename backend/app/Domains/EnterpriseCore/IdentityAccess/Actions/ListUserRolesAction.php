<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;

class ListUserRolesAction
{
    public function execute()
    {
        return Role::all(['id', 'role_name_ar as name', 'role_key']);
    }
}
