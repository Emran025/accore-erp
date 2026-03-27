<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;

class UpdateDepartmentAction
{
    public function execute(int $id, array $data): Department
    {
        $department = Department::findOrFail($id);
        $department->update($data);
        return $department;
    }
}
