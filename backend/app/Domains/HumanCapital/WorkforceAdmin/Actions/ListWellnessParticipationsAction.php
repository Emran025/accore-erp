<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListWellnessParticipationsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = WellnessParticipation::with(['program', 'employee']);
        if ($this->request->filled('program_id')) $query->where('program_id', $this->request->program_id);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        return $this->successResponse($query->orderBy('enrollment_date', 'desc')->paginate(15)->toArray());
    }
}
