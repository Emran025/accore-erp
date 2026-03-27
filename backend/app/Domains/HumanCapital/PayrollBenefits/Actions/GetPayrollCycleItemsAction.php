<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;

class GetPayrollCycleItemsAction
{
    public function execute(int|string $cycleId): PayrollCycle
    {
        return PayrollCycle::with([
            'current_approver',
            'creator',
            'items.employee'
        ])->findOrFail($cycleId);
    }
}
