<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\LeaveRequest;

class ListLeaveRequestsAction
{
    public function execute(array $filters = []): array
    {
        $query = LeaveRequest::with(['employee', 'approver', 'creator']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->where(function($q) use ($filters) {
                $q->whereBetween('start_date', [$filters['start_date'], $filters['end_date']])
                  ->orWhereBetween('end_date', [$filters['start_date'], $filters['end_date']]);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
