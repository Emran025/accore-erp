<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class ActivateEmployeeAction
{
    public function execute(int|string $id): Employee
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['employment_status' => 'active']);
        return $employee;
    }
}
