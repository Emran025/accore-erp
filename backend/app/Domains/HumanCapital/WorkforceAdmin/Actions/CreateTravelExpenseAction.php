<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\TravelExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateTravelExpenseAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'travel_request_id' => 'nullable|exists:travel_requests,id', 'employee_id' => 'required|exists:employees,id',
            'expense_type' => 'required|in:flight,hotel,meal,transportation,other', 'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0', 'currency' => 'required|string|max:3',
            'exchange_rate' => 'nullable|numeric|min:0', 'receipt_path' => 'nullable|string',
            'description' => 'nullable|string', 'notes' => 'nullable|string',
        ]);
        $validated['amount_in_base_currency'] = $validated['amount'] * ($validated['exchange_rate'] ?? 1);
        $validated['status'] = 'pending';
        $validated['is_duplicate'] = false;
        $expense = TravelExpense::create($validated);
        return response()->json(array_merge(['success' => true], $expense->load('travelRequest', 'employee')->toArray()), 201);
    }
}
