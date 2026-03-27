<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;

class DeleteDepartmentAction
{
    public function execute(int $id): void
    {
        Department::destroy($id);
    }
}
