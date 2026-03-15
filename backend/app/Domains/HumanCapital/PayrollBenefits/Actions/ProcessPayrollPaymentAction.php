<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;

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
