<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;

class ProcessPayrollPaymentAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $id, $accountId): PayrollCycle
    {
        return $this->payrollService->processPayment($id, $accountId);
    }
}
