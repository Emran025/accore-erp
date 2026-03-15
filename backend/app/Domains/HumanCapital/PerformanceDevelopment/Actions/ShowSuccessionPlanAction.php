<?php
namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;
use Illuminate\Http\JsonResponse;
class ShowSuccessionPlanAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $plan = SuccessionPlan::with(['incumbent', 'candidates.employee'])->findOrFail($this->id);
        return $this->successResponse($plan->toArray());
    }
}
