<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;

class ShowEmployeeLoanAction
{
    public function execute(int|string $id): array
    {
        $loan = EmployeeLoan::with(['employee', 'repayments'])->findOrFail($id);
        return $loan->toArray();
    }
}
