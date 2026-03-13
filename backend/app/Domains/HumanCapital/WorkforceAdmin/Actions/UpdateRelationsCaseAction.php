<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateRelationsCaseAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $case = EmployeeRelationsCase::findOrFail($this->id);
        $validated = $this->request->validate([
            'status' => 'in:open,under_investigation,hearing,resolved,closed,escalated',
            'resolution' => 'nullable|string', 'resolved_date' => 'nullable|date', 'notes' => 'nullable|string',
        ]);
        if ($this->request->status === 'resolved' && !$case->resolved_date) $validated['resolved_date'] = now();
        $case->update($validated);
        return $this->successResponse($case->load('employee', 'disciplinaryActions')->toArray());
    }
}
