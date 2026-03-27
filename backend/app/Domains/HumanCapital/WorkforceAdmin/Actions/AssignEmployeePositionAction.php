<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class AssignEmployeePositionAction
{
    public function execute(array $data): Employee
    {
        $employee = Employee::findOrFail($data['employee_id']);
        $position = Position::with(['jobTitle', 'role'])->findOrFail($data['position_id']);

        $updateData = ['position_id' => $position->id];

        if ($position->role_id) {
            $updateData['role_id'] = $position->role_id;
        }

        if ($position->job_title_id) {
            $updateData['job_title_id'] = $position->job_title_id;
        }

        if ($position->department_id) {
            $updateData['department_id'] = $position->department_id;
        }

        $employee->update($updateData);

        return $employee->load(['position.jobTitle', 'position.role', 'department']);
    }
}
