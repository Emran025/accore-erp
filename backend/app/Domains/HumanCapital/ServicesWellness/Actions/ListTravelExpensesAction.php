<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelExpense;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListTravelExpensesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = TravelExpense::with(['travelRequest', 'employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['travel_request_id'])) {
            $query->where('travel_request_id', $filters['travel_request_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
