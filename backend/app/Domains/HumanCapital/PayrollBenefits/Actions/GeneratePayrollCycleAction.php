<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;
class GeneratePayrollCycleAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(array $data, $user): PayrollCycle
    {
        return $this->payrollService->generatePayroll($data, $user);
    }
}
