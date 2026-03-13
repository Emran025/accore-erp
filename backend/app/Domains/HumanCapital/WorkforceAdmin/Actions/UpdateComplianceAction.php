<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Manufacturing\Models\QaCompliance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateComplianceAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $compliance = QaCompliance::findOrFail($this->id);
        $validated = $this->request->validate([
            'status' => 'in:pending,in_progress,completed,non_compliant,cancelled',
            'findings' => 'nullable|string', 'corrective_action' => 'nullable|string', 'completed_date' => 'nullable|date',
        ]);
        if ($this->request->status === 'completed' && !$compliance->completed_date) {
            $validated['completed_date'] = now();
            $validated['completed_by'] = auth()->id();
        }
        $compliance->update($validated);
        return $this->successResponse($compliance->load('employee', 'capas')->toArray());
    }
}
