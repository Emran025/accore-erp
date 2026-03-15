<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollItem;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollTransaction;

class GetMyPayslipsAction
{
    public function execute($user, array $filters = []): array
    {
        $employee = Employee::where('user_id', $user->id)->first();

        if (!$employee) {
            throw new \Exception('Employee record not found');
        }

        $query = PayrollItem::where('employee_id', $employee->id)
            ->with(['payrollCycle', 'employee'])
            ->whereHas('payrollCycle', function($q) {
                $q->where('status', 'approved');
            });

        if (!empty($filters['start_date']) && !empty($filters['end_date'])) {
            $query->whereHas('payrollCycle', function($q) use ($filters) {
                $q->whereBetween('period_start', [$filters['start_date'], $filters['end_date']])
                  ->orWhereBetween('period_end', [$filters['start_date'], $filters['end_date']]);
            });
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);

        // Add payment status to each item
        $paginated->getCollection()->transform(function($item) {
            $paidAmount = PayrollTransaction::where('payroll_item_id', $item->id)
                ->where('transaction_type', 'payment')
                ->sum('amount');
            
            $item->paid_amount = $paidAmount;
            $item->remaining_balance = $item->net_salary - $paidAmount;
            return $item;
        });

        return [
            'data' => $paginated->items(),
            'total' => $paginated->total(),
            'current_page' => $paginated->currentPage(),
            'per_page' => $paginated->perPage()
        ];
    }
}
