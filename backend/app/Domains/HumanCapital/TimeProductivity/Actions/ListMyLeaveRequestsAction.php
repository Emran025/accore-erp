<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Exception;

class ListMyLeaveRequestsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $user = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            throw new Exception('Employee record not found');
        }

        $query = LeaveRequest::where('employee_id', $employee->id);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
