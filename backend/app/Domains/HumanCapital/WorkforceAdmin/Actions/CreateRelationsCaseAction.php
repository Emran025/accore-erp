<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateRelationsCaseAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'case_type' => 'required|in:grievance,disciplinary,investigation,whistleblowing,complaint,other',
            'confidentiality_level' => 'required|in:public,confidential,highly_confidential',
            'description' => 'required|string',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);
        $validated['case_number'] = 'CASE-' . date('Ymd') . '-' . str_pad(EmployeeRelationsCase::count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'open';
        $validated['reported_date'] = now();
        $validated['reported_by'] = auth()->id();
        $case = EmployeeRelationsCase::create($validated);
        return response()->json(array_merge(['success' => true], $case->load('employee')->toArray()), 201);
    }
}
