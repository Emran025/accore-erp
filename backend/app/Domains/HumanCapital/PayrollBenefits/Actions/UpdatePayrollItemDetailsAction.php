<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\PayrollService;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollEntry;

class UpdatePayrollItemDetailsAction
{
    protected PayrollService $payrollService;

    public function __construct(PayrollService $payrollService)
    {
        $this->payrollService = $payrollService;
    }

    public function execute(int|string $itemId, array $data): PayrollEntry
    {
        return $this->payrollService->updatePayrollItem($itemId, $data);
    }
}
