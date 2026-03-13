<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use Illuminate\Database\Eloquent\Builder;

class ListPositionsAction
{
    public function execute(array $filters = []): array
    {
        $query = Position::with(['jobTitle', 'role', 'department', 'employees' => function ($q) {
            $q->where('is_active', true)->select('id', 'full_name', 'employee_code', 'position_id');
        }]);

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (isset($filters['job_title_id'])) {
            $query->where('job_title_id', $filters['job_title_id']);
        }

        if (isset($filters['role_id'])) {
            $query->where('role_id', $filters['role_id']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search) {
                $q->where('position_name_ar', 'like', "%{$search}%")
                  ->orWhere('position_name_en', 'like', "%{$search}%")
                  ->orWhere('position_code', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $positions = $query->orderBy('position_code')->get()->map(function ($position) {
            $position->active_employee_count = $position->employees->count();
            return $position;
        });

        return $positions->toArray();
    }
}
