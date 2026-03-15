<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListSchedulesAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = WorkforceSchedule::with(['department', 'shifts.employee']);
        if ($this->request->filled('department_id')) $query->where('department_id', $this->request->department_id);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        if ($this->request->filled('schedule_date')) $query->where('schedule_date', $this->request->schedule_date);
        return $this->successResponse($query->orderBy('schedule_date', 'desc')->paginate(15)->toArray());
    }
}
