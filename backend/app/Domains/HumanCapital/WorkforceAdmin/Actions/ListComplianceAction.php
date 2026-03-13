<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Manufacturing\Models\QaCompliance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListComplianceAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = QaCompliance::with(['employee', 'capas']);
        if ($this->request->filled('compliance_type')) $query->where('compliance_type', $this->request->compliance_type);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }
}
