<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Pagination\LengthAwarePaginator;
class ListDepartmentsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = Department::with('manager');
        
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('name_ar', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%");
        }

        return $query->paginate(15);
    }
}
