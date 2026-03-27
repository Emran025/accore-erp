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
use App\Http\Resources\HumanCapital\ServicesWellness\EmployeeLoanResource;
use App\Http\Resources\HumanCapital\ServicesWellness\LoanRepaymentResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\Request;

class EmployeeLoansController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListEmployeeLoansAction $action)
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(EmployeeLoanResource::collection($paginator));
    }

    public function store(StoreEmployeeLoanRequest $request, CreateEmployeeLoanAction $action)
    {
        $loan = $action->execute($request->validated());
        return $this->successResponse(new EmployeeLoanResource($loan), 'Loan request created successfully', 201);
    }

    public function show($id, ShowEmployeeLoanAction $action)
    {
        $loan = $action->execute($id);
        return $this->successResponse(new EmployeeLoanResource($loan));
    }

    public function updateStatus(UpdateEmployeeLoanStatusRequest $request, $id, UpdateEmployeeLoanStatusAction $action)
    {
        $loan = $action->execute($id, $request->validated());
        return $this->successResponse(new EmployeeLoanResource($loan), 'Loan status updated successfully');
    }

    public function recordRepayment(RecordLoanRepaymentRequest $request, $id, $repaymentId, RecordLoanRepaymentAction $action)
    {
        $repayment = $action->execute($id, $repaymentId, $request->validated());
        return $this->successResponse(new LoanRepaymentResource($repayment), 'Repayment recorded successfully');
    }
}
