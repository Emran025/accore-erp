<?php

namespace App\Domains\HumanCapital\Payroll\Services;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

interface SalaryCalculatorInterface
{
    /**
     * Calculate payroll breakdown for an employee for a given period
     * 
     * @param Employee $employee
     * @param string $periodStart
     * @param string $periodEnd
     * @return array Contains: base_salary, allowances, deductions, overtime, gross_salary, net_salary
     */
    public function calculate(Employee $employee, string $periodStart, string $periodEnd): array;
}



