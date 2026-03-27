<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use Illuminate\Pagination\LengthAwarePaginator;

class ListExpatRecordsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = ExpatManagement::with(['employee', 'documents']);
        
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }
        
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('employee', function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }
        
        return $query->paginate(15);
    }
}
