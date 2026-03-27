<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;

class ShowEmployeeLoanAction
{
    public function execute(int|string $id): EmployeeLoan
    {
        return EmployeeLoan::with(['employee', 'repayments'])->findOrFail($id);
    }
}
