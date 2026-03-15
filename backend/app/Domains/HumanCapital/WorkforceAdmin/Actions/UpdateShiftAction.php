<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Models\ScheduleShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateShiftAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $scheduleId, private readonly int $shiftId) {}
    public function __invoke(): JsonResponse
    {
        $shift = ScheduleShift::where('schedule_id', $this->scheduleId)->findOrFail($this->shiftId);
        $validated = $this->request->validate([
            'status' => 'in:scheduled,confirmed,swapped,cancelled,completed',
            'swapped_with' => 'nullable|exists:employees,id', 'notes' => 'nullable|string',
        ]);
        $shift->update($validated);
        return $this->successResponse($shift->load('employee')->toArray());
    }
}
