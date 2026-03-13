<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Services\PayrollService;

class TogglePayrollItemStatusAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $itemId): array
    {
        $item = $this->payrollService->toggleItemStatus($itemId);
        return $item->toArray();
    }
}
