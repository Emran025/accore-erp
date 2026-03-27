<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeHealthRecord;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListHealthRecordsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = EmployeeHealthRecord::with(['employee']);

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['record_type'])) {
            $query->where('record_type', $filters['record_type']);
        }

        return $query->orderBy('record_date', 'desc')->paginate(15);
    }
}
