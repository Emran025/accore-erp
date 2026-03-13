<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollItem;
use App\Domains\HumanCapital\Payroll\Models\PayrollCycle;
use App\Domains\HumanCapital\Payroll\Models\PayrollTransaction;

class GetPayrollCycleItemsAction
{
    public function execute(int|string $cycleId): array
    {
        $items = PayrollItem::where('payroll_cycle_id', $cycleId)
            ->with('employee:id,full_name,employee_code')
            ->get()
            ->map(function ($item) {
                $paidAmount = PayrollTransaction::where('payroll_item_id', $item->id)
                    ->where('transaction_type', 'payment')
                    ->sum('amount');

                $advanceAmount = PayrollTransaction::where('payroll_item_id', $item->id)
                    ->where('transaction_type', 'advance')
                    ->sum('amount');

                $remainingBalance = $item->net_salary - $paidAmount;
                $netAfterAdvance = $item->net_salary - $advanceAmount;

                return [
                    'id' => $item->id,
                    'payroll_cycle_id' => $item->payroll_cycle_id,
                    'employee_id' => $item->employee_id,
                    'employee_name' => $item->employee->full_name ?? 'N/A',
                    'employee' => $item->employee,
                    'base_salary' => (float) $item->base_salary,
                    'total_allowances' => (float) $item->total_allowances,
                    'total_deductions' => (float) $item->total_deductions,
                    'gross_salary' => (float) $item->gross_salary,
                    'net_salary' => (float) $item->net_salary,
                    'status' => $item->status,
                    'paid_amount' => (float) $paidAmount,
                    'remaining_balance' => (float) $remainingBalance,
                    'advance_amount' => (float) $advanceAmount,
                    'net_after_advance' => (float) $netAfterAdvance,
                    'notes' => $item->notes,
                ];
            });

        $cycle = PayrollCycle::with(['current_approver', 'creator'])->findOrFail($cycleId);

        return [
            'data' => $items,
            'cycle' => $cycle
        ];
    }
}
