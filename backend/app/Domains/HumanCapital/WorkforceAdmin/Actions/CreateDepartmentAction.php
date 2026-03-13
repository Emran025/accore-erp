<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class CreateDepartmentAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('employees', 'create');

        $department = Department::create($data);
        return $department->toArray();
    }
}
