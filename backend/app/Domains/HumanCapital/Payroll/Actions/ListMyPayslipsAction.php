<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\Payroll\Models\PayrollItem;
use App\Domains\HumanCapital\Payroll\Models\PayrollTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListMyPayslipsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $user = auth()->user();
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            return response()->json(['error' => 'Employee record not found'], 404);
        }

        $query = PayrollItem::where('employee_id', $employee->id)
            ->with(['payrollCycle', 'employee'])
            ->whereHas('payrollCycle', function($q) {
                $q->where('status', 'approved');
            });

        if ($this->request->filled('start_date') && $this->request->filled('end_date')) {
            $query->whereHas('payrollCycle', function($q) {
                $q->whereBetween('period_start', [$this->request->start_date, $this->request->end_date])
                  ->orWhereBetween('period_end', [$this->request->start_date, $this->request->end_date]);
            });
        }

        $items = $query->orderBy('created_at', 'desc')->paginate(15);

        // Add payment status to each item
        $items->getCollection()->transform(function($item) {
            $paidAmount = PayrollTransaction::where('payroll_item_id', $item->id)
                ->where('transaction_type', 'payment')
                ->sum('amount');
            
            $item->paid_amount = $paidAmount;
            $item->remaining_balance = $item->net_salary - $paidAmount;
            return $item;
        });

        return response()->json($items);
    }
}
