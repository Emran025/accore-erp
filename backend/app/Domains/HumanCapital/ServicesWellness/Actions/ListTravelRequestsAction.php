<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListTravelRequestsAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = TravelRequest::with(['employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
