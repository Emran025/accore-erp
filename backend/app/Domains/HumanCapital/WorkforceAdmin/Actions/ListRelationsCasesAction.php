<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListRelationsCasesAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = EmployeeRelationsCase::with(['employee', 'disciplinaryActions']);

        if (!empty($filters['case_type'])) {
            $query->where('case_type', $filters['case_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        $user = auth()->user();
        if ($user && !$user->hasRole(['hr_manager', 'admin'])) {
            $query->where('confidentiality_level', '!=', 'highly_confidential');
        }

        return $query->orderBy('reported_date', 'desc')->paginate(15);
    }
}
