<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Services\EOSBCalculatorService;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class PreviewEOSBCalculationAction
{
    protected EOSBCalculatorService $eosbCalculator;

    public function __construct(EOSBCalculatorService $eosbCalculator)
    {
        $this->eosbCalculator = $eosbCalculator;
    }

    public function execute(array $data): array
    {
        $employee = Employee::findOrFail($data['employee_id']);

        $calculation = $this->eosbCalculator->calculate(
            $employee,
            $data['termination_date'],
            $data['termination_reason']
        );

        return $calculation;
    }
}
