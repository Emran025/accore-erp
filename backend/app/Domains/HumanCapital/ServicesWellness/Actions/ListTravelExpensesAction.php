<?php
namespace App\Domains\HumanCapital\ServicesWellness\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\ServicesWellness\Models\TravelExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListTravelExpensesAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = TravelExpense::with(['travelRequest', 'employee']);
        if ($this->request->filled('travel_request_id')) $query->where('travel_request_id', $this->request->travel_request_id);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        return $this->successResponse($query->orderBy('expense_date', 'desc')->paginate(15)->toArray());
    }
}
