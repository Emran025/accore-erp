<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\Role;

class ListUserRolesAction
{
    public function execute()
    {
        return Role::all(['id', 'role_name_ar as name', 'role_key']);
    }
}
