<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Services\PayrollService;

class GeneratePayrollCycleAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(array $data, $user): array
    {
        $cycle = $this->payrollService->generatePayroll($data, $user);
        return $cycle->toArray();
    }
}
