<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeAndAttendance\Models\WorkforceSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateScheduleAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $schedule = WorkforceSchedule::findOrFail($this->id);
        $validated = $this->request->validate([
            'schedule_name' => 'string|max:255', 'status' => 'in:draft,published,archived', 'notes' => 'nullable|string',
        ]);
        $schedule->update($validated);
        return $this->successResponse($schedule->load('department', 'shifts.employee')->toArray());
    }
}
