<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListSchedulesAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = WorkforceSchedule::with(['department', 'shifts.employee']);

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['schedule_date'])) {
            $query->where('schedule_date', $filters['schedule_date']);
        }

        return $query->orderBy('schedule_date', 'desc')->paginate(15);
    }
}
