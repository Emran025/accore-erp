<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateDepartmentAction
{
    public function execute(array $data): Department
    {
        PermissionService::requirePermission('employees', 'create');

        return Department::create($data);
    }
}
