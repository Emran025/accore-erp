<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Services\PayrollService;

class UpdatePayrollItemDetailsAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $itemId, array $data): array
    {
        $item = $this->payrollService->updatePayrollItem($itemId, $data);
        return current($item->toArray()) ?: reset($item);
    }
}
