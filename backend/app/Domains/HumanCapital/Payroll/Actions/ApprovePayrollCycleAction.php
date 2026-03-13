<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Services\PayrollService;

class ApprovePayrollCycleAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $id, $user): array
    {
        $cycle = $this->payrollService->approvePayroll($id, $user);
        return $cycle->toArray();
    }
}
