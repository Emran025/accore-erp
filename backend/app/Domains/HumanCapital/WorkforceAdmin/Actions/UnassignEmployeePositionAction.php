<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class UnassignEmployeePositionAction
{
    public function execute(int|string $employeeId): void
    {
        $employee = Employee::findOrFail($employeeId);
        $employee->update(['position_id' => null]);
    }
}
