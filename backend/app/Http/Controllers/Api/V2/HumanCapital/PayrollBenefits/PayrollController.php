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
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
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
            $cycle = $action->execute(
                $request->validated(),
                auth()->user()
            );
            return $this->successResponse($cycle, 'Payroll generated successfully', 201);
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
            return $this->successResponse($cycle, 'Payroll approved successfully');
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
            return $this->successResponse($cycle, 'Payroll payment processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function toggleItemStatus(Request $request, $itemId, TogglePayrollItemStatusAction $action)
    {
        try {
            $item = $action->execute($itemId);
            return $this->successResponse($item, 'Item status toggled successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function getCycleItems($cycleId, GetPayrollCycleItemsAction $action)
    {
        try {
            $result = $action->execute($cycleId);
            return $this->successResponse($result);
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
            $transaction = $action->execute($itemId, $validated);

            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الدفعة بنجاح',
                'transaction' => $transaction
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getItemTransactions($itemId, GetPayrollItemTransactionsAction $action)
    {
        try {
            $transactions = $action->execute($itemId);
            return response()->json(['data' => $transactions]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateItem(UpdatePayrollItemRequest $request, $itemId, UpdatePayrollItemDetailsAction $action)
    {
        try {
            $item = $action->execute($itemId, $request->validated());
            return $this->successResponse($item, 'Payroll item updated successfully');
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
                $paginated['data'],
                $paginated['total'],
                $paginated['current_page'],
                $paginated['per_page']
            );
        } catch (\Exception $e) {
            if ($e->getMessage() === 'Employee record not found') {
                return response()->json(['error' => $e->getMessage()], 404);
            }
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
