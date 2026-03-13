<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollCycle;

class ListPayrollCyclesAction
{
    public function execute(): array
    {
        $cycles = PayrollCycle::with(['current_approver', 'creator'])->orderBy('created_at', 'desc')->paginate(15);
        return [
            'data' => $cycles->items(),
            'total' => $cycles->total(),
            'current_page' => $cycles->currentPage(),
            'per_page' => $cycles->perPage(),
        ];
    }
}
