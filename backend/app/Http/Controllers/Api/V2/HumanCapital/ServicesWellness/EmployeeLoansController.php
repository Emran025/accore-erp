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
use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;
use App\Domains\HumanCapital\ServicesWellness\Models\LoanRepayment;
use App\Http\Resources\HumanCapital\ServicesWellness\EmployeeLoanResource;
use App\Http\Resources\HumanCapital\ServicesWellness\LoanRepaymentResource;
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
            EmployeeLoanResource::collection($paginated['data']),
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function store(StoreEmployeeLoanRequest $request, CreateEmployeeLoanAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $loan = EmployeeLoan::find($result['id'] ?? $result);
        return $this->successResponse(new EmployeeLoanResource($loan), 'Loan request created successfully', 201);
    }

    public function show($id, ShowEmployeeLoanAction $action)
    {
        $result = $action->execute($id);
        $loan = EmployeeLoan::find($result['id'] ?? $id);
        return $this->successResponse(new EmployeeLoanResource($loan));
    }

    public function updateStatus(UpdateEmployeeLoanStatusRequest $request, $id, UpdateEmployeeLoanStatusAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $loan = EmployeeLoan::find($result['id'] ?? $id);
        return $this->successResponse(new EmployeeLoanResource($loan), 'Loan status updated successfully');
    }

    public function recordRepayment(RecordLoanRepaymentRequest $request, $id, $repaymentId, RecordLoanRepaymentAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $repaymentId, $validated);
        $repayment = LoanRepayment::find($result['id'] ?? $result);
        return $this->successResponse(new LoanRepaymentResource($repayment), 'Repayment recorded successfully');
    }
}
