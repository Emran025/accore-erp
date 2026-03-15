<?php
namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListSuccessionPlansAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = SuccessionPlan::with(['incumbent', 'candidates.employee']);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        if ($this->request->filled('readiness_level')) $query->where('readiness_level', $this->request->readiness_level);
        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }
}
