<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;

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
