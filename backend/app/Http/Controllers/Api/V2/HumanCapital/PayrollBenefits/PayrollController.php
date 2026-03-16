<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListPayrollCyclesAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\GeneratePayrollCycleAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ApprovePayrollCycleAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ProcessPayrollPaymentAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\TogglePayrollItemStatusAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\GetPayrollCycleItemsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\PayIndividualPayrollItemAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\GetPayrollItemTransactionsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdatePayrollItemDetailsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\GetMyPayslipsAction;
use App\Http\Requests\HumanCapital\PayrollBenefits\GeneratePayrollRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\PayIndividualItemRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdatePayrollItemRequest;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollEntry;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollTransaction;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollCycleResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollEntryResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollTransactionResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

/**
 * Controller for Payroll operations via API.
 * Handles payroll cycle generation, approval workflow, individual payments,
 * and employee payslip access.
 */
class PayrollController extends Controller
{
    use BaseApiController;

    /**
     * List all payroll cycles with pagination.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(ListPayrollCyclesAction $action)
    {
        $paginated = $action->execute();
        
        return $this->paginatedResponse(
            PayrollCycleResource::collection($paginated['data'] ?? $paginated)->resolve(),
            $paginated['total'] ?? (is_countable($paginated) ? count($paginated) : 0),
            $paginated['current_page'] ?? 1,
            $paginated['per_page'] ?? 15
        );
    }

    /**
     * Generate a new payroll cycle.
     * Supports salary, bonus, incentive, and other payment types.
     * 
     * @param GeneratePayrollRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generatePayroll(GeneratePayrollRequest $request, GeneratePayrollCycleAction $action)
    {
        try {
            $result = $action->execute(
                $request->validated(),
                auth()->user()
            );
            $cycle = PayrollCycle::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new PayrollCycleResource($cycle))->resolve(), 'Payroll generated successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Approve a payroll cycle.
     * Advances the multi-level approval workflow.
     * 
     * @param Request $request
     * @param int $id Payroll cycle ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Request $request, $id, ApprovePayrollCycleAction $action)
    {
        try {
            $result = $action->execute($id, auth()->user());
            $cycle = PayrollCycle::findOrFail($result['id'] ?? $id);
            return $this->successResponse((new PayrollCycleResource($cycle))->resolve(), 'Payroll approved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Process payment for an entire approved payroll cycle.
     * Posts GL entries and updates cycle status to 'paid'.
     * 
     * @param Request $request
     * @param int $id Payroll cycle ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function processPayment(Request $request, $id, ProcessPayrollPaymentAction $action)
    {
        try {
            $result = $action->execute($id, $request->account_id);
            $cycle = PayrollCycle::findOrFail($result['id'] ?? $id);
            return $this->successResponse((new PayrollCycleResource($cycle))->resolve(), 'Payroll payment processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function toggleItemStatus(Request $request, $itemId, TogglePayrollItemStatusAction $action)
    {
        try {
            $result = $action->execute($itemId);
            $item = PayrollEntry::findOrFail($result['id'] ?? $itemId);
            return $this->successResponse((new PayrollEntryResource($item))->resolve(), 'Item status toggled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getCycleItems($cycleId, GetPayrollCycleItemsAction $action)
    {
        try {
            $result = $action->execute($cycleId);
            $data = $result['data'] ?? $result;
            return $this->successResponse(PayrollEntryResource::collection($data)->resolve());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Pay an individual payroll item (partial or full).
     * Creates PayrollTransaction records and posts journal entries.
     * 
     * @param PayIndividualItemRequest $request
     * @param int $itemId Payroll item ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function payIndividualItem(PayIndividualItemRequest $request, $itemId, PayIndividualPayrollItemAction $action)
    {
        $validated = $request->validated();

        try {
            $result = $action->execute($itemId, $validated);
            $transaction = PayrollTransaction::findOrFail($result['id'] ?? $result);

            return $this->successResponse((new PayrollTransactionResource($transaction))->resolve(), 'تم تسجيل الدفعة بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getItemTransactions($itemId, GetPayrollItemTransactionsAction $action)
    {
        try {
            $transactions = $action->execute($itemId);
            $data = $transactions['data'] ?? $transactions;
            return $this->successResponse(PayrollTransactionResource::collection($data)->resolve());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function updateItem(UpdatePayrollItemRequest $request, $itemId, UpdatePayrollItemDetailsAction $action)
    {
        try {
            $result = $action->execute($itemId, $request->validated());
            $item = PayrollEntry::findOrFail($result['id'] ?? $itemId);
            return $this->successResponse((new PayrollEntryResource($item))->resolve(), 'Payroll item updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get payslips for the authenticated employee
     */
    public function myPayslips(Request $request, GetMyPayslipsAction $action)
    {
        try {
            $filters = $request->only(['start_date', 'end_date']);
            $paginated = $action->execute(auth()->user(), $filters);

            return $this->paginatedResponse(
                PayrollEntryResource::collection($paginated['data'] ?? $paginated)->resolve(),
                $paginated['total'] ?? (is_countable($paginated) ? count($paginated) : 0),
                $paginated['current_page'] ?? 1,
                $paginated['per_page'] ?? 15
            );
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Employee record not found') {
                return $this->errorResponse($e->getMessage(), 404);
            }
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
