<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use Illuminate\Http\JsonResponse;
class ShowRelationsCaseAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $case = EmployeeRelationsCase::with(['employee', 'disciplinaryActions'])->findOrFail($this->id);
        $user = auth()->user();
        if ($case->confidentiality_level === 'highly_confidential' && !$user->hasRole('hr_manager') && !$user->hasRole('admin')) {
            return $this->errorResponse('Access denied: Highly confidential case', 403);
        }
        return $this->successResponse($case->toArray());
    }
}
