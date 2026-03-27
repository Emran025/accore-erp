<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;

class ShowDepartmentAction
{
    public function execute(int $id): Department
    {
        return Department::with('manager')->findOrFail($id);
    }
}
