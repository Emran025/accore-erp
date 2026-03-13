<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Services\PayrollService;

class ProcessPayrollPaymentAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $id, $accountId): array
    {
        $cycle = $this->payrollService->processPayment($id, $accountId);
        return $cycle->toArray();
    }
}
