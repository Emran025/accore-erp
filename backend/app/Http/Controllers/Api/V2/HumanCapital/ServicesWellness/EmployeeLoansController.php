<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\ServicesWellness;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\ServicesWellness\StoreEmployeeLoanRequest;
use App\Http\Requests\HumanCapital\ServicesWellness\UpdateEmployeeLoanStatusRequest;
use App\Http\Requests\HumanCapital\ServicesWellness\RecordLoanRepaymentRequest;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListEmployeeLoansAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreateEmployeeLoanAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\ShowEmployeeLoanAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\UpdateEmployeeLoanStatusAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\RecordLoanRepaymentAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class EmployeeLoansController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListEmployeeLoansAction $action)
    {
        $filters = $request->only(['employee_id', 'loan_type', 'status']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function store(StoreEmployeeLoanRequest $request, CreateEmployeeLoanAction $action)
    {
        $validated = $request->validated();
        $loan = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $loan), 201);
    }

    public function show($id, ShowEmployeeLoanAction $action)
    {
        $loan = $action->execute($id);
        return $this->successResponse($loan);
    }

    public function updateStatus(UpdateEmployeeLoanStatusRequest $request, $id, UpdateEmployeeLoanStatusAction $action)
    {
        $validated = $request->validated();
        $loan = $action->execute($id, $validated);

        return $this->successResponse($loan);
    }

    public function recordRepayment(RecordLoanRepaymentRequest $request, $id, $repaymentId, RecordLoanRepaymentAction $action)
    {
        $validated = $request->validated();
        $repayment = $action->execute($id, $repaymentId, $validated);

        return $this->successResponse($repayment);
    }
}
