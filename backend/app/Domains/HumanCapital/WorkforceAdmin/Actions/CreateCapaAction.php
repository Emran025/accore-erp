<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Manufacturing\Models\Capa;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateCapaAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $complianceId) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'nullable|exists:employees,id', 'type' => 'required|in:corrective,preventive',
            'issue_description' => 'required|string', 'root_cause' => 'nullable|string',
            'action_plan' => 'nullable|string', 'target_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id', 'notes' => 'nullable|string',
        ]);
        $validated['compliance_id'] = $this->complianceId;
        $validated['capa_number'] = 'CAPA-' . date('Ymd') . '-' . str_pad(Capa::count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'open';
        $capa = Capa::create($validated);
        return response()->json(array_merge(['success' => true], $capa->load('compliance', 'employee')->toArray()), 201);
    }
}
