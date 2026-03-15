<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;
use Illuminate\Support\Facades\DB;
use Exception;

class ListMyLeaveRequestsAction
{
    public function execute(array $filters = []): array
    {
        $user = auth()->user();
        $employee = \App\Domains\HumanCapital\WorkforceAdmin\Models\Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            throw new Exception('Employee record not found');
        }

        $query = LeaveRequest::where('employee_id', $employee->id);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
