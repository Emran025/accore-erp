<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Database\Eloquent\Builder;

class ListEmployeesAction
{
    public function execute(array $filters = []): array
    {
        $query = Employee::with(['role', 'department', 'position.jobTitle']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function(Builder $q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        return $query->paginate(15)->toArray();
    }
}
