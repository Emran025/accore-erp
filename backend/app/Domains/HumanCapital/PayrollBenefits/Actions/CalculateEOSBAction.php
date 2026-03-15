<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\EOSBCalculatorService;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class CalculateEOSBAction
{
    protected EOSBCalculatorService $eosbCalculator;

    public function __construct(EOSBCalculatorService $eosbCalculator)
    {
        $this->eosbCalculator = $eosbCalculator;
    }

    public function execute(int|string $employeeId, array $data): array
    {
        $employee = Employee::findOrFail($employeeId);

        $calculation = $this->eosbCalculator->calculate(
            $employee,
            $data['termination_date'],
            $data['termination_reason']
        );

        return $calculation;
    }
}
