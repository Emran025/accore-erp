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
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollCycleResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollEntryResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollTransactionResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\Request;

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
        $paginator = $action->execute();
        return $this->successResponse(PayrollCycleResource::collection($paginator));
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
            $cycle = $action->execute($request->validated(), auth()->user());
            return $this->successResponse(new PayrollCycleResource($cycle), 'Payroll generated successfully', 201);
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
            $cycle = $action->execute($id, auth()->user());
            return $this->successResponse(new PayrollCycleResource($cycle), 'Payroll approved successfully');
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
            $cycle = $action->execute($id, $request->account_id);
            return $this->successResponse(new PayrollCycleResource($cycle), 'Payroll payment processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function toggleItemStatus(Request $request, $itemId, TogglePayrollItemStatusAction $action)
    {
        try {
            $item = $action->execute($itemId);
            return $this->successResponse(new PayrollEntryResource($item), 'Item status toggled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getCycleItems($cycleId, GetPayrollCycleItemsAction $action)
    {
        try {
            $cycle = $action->execute($cycleId);
            return $this->successResponse([
                'cycle' => new PayrollCycleResource($cycle),
                'items' => PayrollEntryResource::collection($cycle->items)
            ]);
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
        try {
            $transaction = $action->execute($itemId, $request->validated());
            return $this->successResponse(new PayrollTransactionResource($transaction), 'تم تسجيل الدفعة بنجاح', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getItemTransactions($itemId, GetPayrollItemTransactionsAction $action)
    {
        try {
            $transactions = $action->execute($itemId);
            return $this->successResponse(PayrollTransactionResource::collection($transactions));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function updateItem(UpdatePayrollItemRequest $request, $itemId, UpdatePayrollItemDetailsAction $action)
    {
        try {
            $item = $action->execute($itemId, $request->validated());
            return $this->successResponse(new PayrollEntryResource($item), 'Payroll item updated successfully');
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
            $paginator = $action->execute(auth()->user(), $filters);
            return $this->successResponse(PayrollEntryResource::collection($paginator));
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Employee record not found') {
                return $this->errorResponse($e->getMessage(), 404);
            }
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
