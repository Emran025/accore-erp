<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeAndAttendance\Models\ScheduleShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateShiftAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $scheduleId) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id', 'shift_date' => 'required|date',
            'start_time' => 'required', 'end_time' => 'required',
            'shift_type' => 'required|in:regular,overtime,on_call,standby', 'notes' => 'nullable|string',
        ]);
        $start = \Carbon\Carbon::parse($validated['shift_date'] . ' ' . $validated['start_time']);
        $end = \Carbon\Carbon::parse($validated['shift_date'] . ' ' . $validated['end_time']);
        $validated['schedule_id'] = $this->scheduleId;
        $validated['hours'] = $start->diffInHours($end);
        $validated['status'] = 'scheduled';
        $shift = ScheduleShift::create($validated);
        return response()->json(array_merge(['success' => true], $shift->load('employee')->toArray()), 201);
    }
}
