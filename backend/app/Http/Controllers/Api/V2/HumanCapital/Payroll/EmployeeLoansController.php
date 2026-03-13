<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\Payroll;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\Payroll\Models\EmployeeLoan;
use App\Domains\HumanCapital\Payroll\Models\LoanRepayment;
use App\Http\Requests\HumanCapital\Payroll\StoreEmployeeLoanRequest;
use App\Http\Requests\HumanCapital\Payroll\UpdateEmployeeLoanStatusRequest;
use App\Http\Requests\HumanCapital\Payroll\RecordLoanRepaymentRequest;
use App\Domains\HumanCapital\Payroll\Actions\ListEmployeeLoansAction;
use App\Domains\HumanCapital\Payroll\Actions\CreateEmployeeLoanAction;
use App\Domains\HumanCapital\Payroll\Actions\ShowEmployeeLoanAction;
use App\Domains\HumanCapital\Payroll\Actions\UpdateEmployeeLoanStatusAction;
use App\Domains\HumanCapital\Payroll\Actions\RecordLoanRepaymentAction;
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
