<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateWellnessParticipationAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'program_id' => 'required|exists:wellness_programs,id',
            'employee_id' => 'required|exists:employees,id', 'notes' => 'nullable|string',
        ]);
        $validated['enrollment_date'] = now();
        $validated['status'] = 'enrolled';
        $validated['points'] = 0;
        $validated['metrics_data'] = [];
        $participation = WellnessParticipation::create($validated);
        return response()->json(array_merge(['success' => true], $participation->load('program', 'employee')->toArray()), 201);
    }
}
