<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateWellnessProgramAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'program_name' => 'required|string|max:255', 'description' => 'nullable|string',
            'program_type' => 'required|in:steps_challenge,health_challenge,fitness,nutrition,mental_health,other',
            'start_date' => 'required|date', 'end_date' => 'required|date|after:start_date',
            'target_metrics' => 'nullable|array', 'notes' => 'nullable|string',
        ]);
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();
        $program = WellnessProgram::create($validated);
        return response()->json(array_merge(['success' => true], $program->toArray()), 201);
    }
}
