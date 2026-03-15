<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Manufacturing\QualityControl\Models\QaCompliance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateComplianceAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'compliance_type' => 'required|in:iso,soc,internal_audit,regulatory,other',
            'standard_name' => 'required|string|max:255', 'description' => 'nullable|string',
            'employee_id' => 'nullable|exists:employees,id', 'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|exists:users,id', 'notes' => 'nullable|string',
        ]);
        $validated['compliance_number'] = 'COMP-' . date('Ymd') . '-' . str_pad(QaCompliance::count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'pending';
        $compliance = QaCompliance::create($validated);
        return response()->json(array_merge(['success' => true], $compliance->load('employee')->toArray()), 201);
    }
}
