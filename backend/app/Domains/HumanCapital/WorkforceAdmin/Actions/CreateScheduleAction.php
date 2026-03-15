<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateScheduleAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'schedule_name' => 'required|string|max:255', 'schedule_date' => 'required|date',
            'department_id' => 'nullable|exists:departments,id', 'notes' => 'nullable|string',
        ]);
        $validated['status'] = 'draft';
        $validated['created_by'] = auth()->id();
        $schedule = WorkforceSchedule::create($validated);
        return response()->json(array_merge(['success' => true], $schedule->load('department')->toArray()), 201);
    }
}
