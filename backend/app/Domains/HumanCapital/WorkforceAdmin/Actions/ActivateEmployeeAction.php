<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class ActivateEmployeeAction
{
    public function execute(int|string $id): array
    {
        $employee = Employee::findOrFail($id);
        $employee->update(['employment_status' => 'active']);
        return $employee->toArray();
    }
}
