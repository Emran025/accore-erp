<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use Illuminate\Pagination\LengthAwarePaginator;

class ListWellnessParticipationsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = WellnessParticipation::with(['program', 'employee']);

        if (!empty($filters['program_id'])) {
            $query->where('program_id', $filters['program_id']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        return $query->orderBy('enrollment_date', 'desc')->paginate(15);
    }
}
