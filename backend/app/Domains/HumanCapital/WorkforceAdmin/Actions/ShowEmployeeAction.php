<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class ShowEmployeeAction
{
    public function execute(int|string $id): Employee
    {
        return Employee::with([
            'role', 
            'department', 
            'position.jobTitle', 
            'documents', 
            'allowances', 
            'deductions', 
            'jobTitle'
        ])->findOrFail($id);
    }
}
