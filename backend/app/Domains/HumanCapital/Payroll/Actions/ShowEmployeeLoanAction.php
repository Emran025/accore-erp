<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\EmployeeLoan;

class ShowEmployeeLoanAction
{
    public function execute(int|string $id): array
    {
        $loan = EmployeeLoan::with(['employee', 'repayments'])->findOrFail($id);
        return $loan->toArray();
    }
}
