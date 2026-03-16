<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
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
