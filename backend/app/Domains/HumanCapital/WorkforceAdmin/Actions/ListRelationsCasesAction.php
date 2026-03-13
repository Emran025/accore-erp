<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListRelationsCasesAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = EmployeeRelationsCase::with(['employee', 'disciplinaryActions']);
        if ($this->request->filled('case_type')) $query->where('case_type', $this->request->case_type);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        $user = auth()->user();
        if (!$user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            $query->where('confidentiality_level', '!=', 'highly_confidential');
        }
        return $this->successResponse($query->orderBy('reported_date', 'desc')->paginate(15)->toArray());
    }
}
