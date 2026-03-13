<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\TravelExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateTravelExpenseStatusAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $expense = TravelExpense::findOrFail($this->id);
        $validated = $this->request->validate(['status' => 'required|in:pending,submitted,approved,rejected,reimbursed']);
        if (in_array($this->request->status, ['approved', 'rejected'])) $validated['approved_by'] = auth()->id();
        $expense->update($validated);
        return $this->successResponse($expense->load('travelRequest', 'employee')->toArray());
    }
}
