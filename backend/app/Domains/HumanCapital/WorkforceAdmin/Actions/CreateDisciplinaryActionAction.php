<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\DisciplinaryAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateDisciplinaryActionAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $caseId) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'action_type' => 'required|in:verbal_warning,written_warning,final_warning,suspension,termination,other',
            'violation_description' => 'required|string', 'action_taken' => 'required|string',
            'action_date' => 'required|date', 'expiry_date' => 'nullable|date', 'notes' => 'nullable|string',
        ]);
        $validated['case_id'] = $this->caseId;
        $validated['issued_by'] = auth()->id();
        $action = DisciplinaryAction::create($validated);
        return response()->json(array_merge(['success' => true], $action->load('employee', 'case')->toArray()), 201);
    }
}
