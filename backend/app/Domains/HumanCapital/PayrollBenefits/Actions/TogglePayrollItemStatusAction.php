<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollEntry;
class TogglePayrollItemStatusAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $itemId): PayrollEntry
    {
        return $this->payrollService->toggleItemStatus($itemId);
    }
}
