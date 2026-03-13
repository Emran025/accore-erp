<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class ListEmployeeDocumentsAction
{
    public function execute(int|string $employeeId): array
    {
        $employee = Employee::findOrFail($employeeId);
        return $employee->documents->toArray();
    }
}
