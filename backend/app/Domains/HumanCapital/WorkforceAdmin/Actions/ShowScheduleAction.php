<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;
use Illuminate\Http\JsonResponse;
class ShowScheduleAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $schedule = WorkforceSchedule::with(['department', 'shifts.employee'])->findOrFail($this->id);
        return $this->successResponse($schedule->toArray());
    }
}
