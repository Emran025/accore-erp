<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Database\Eloquent\Collection;

class ListEmployeeDocumentsAction
{
    public function execute(int|string $employeeId): Collection
    {
        $employee = Employee::findOrFail($employeeId);
        return $employee->documents;
    }
}
