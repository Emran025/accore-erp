<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeLoan;

class UpdateEmployeeLoanStatusAction
{
    public function execute(int|string $id, array $data): EmployeeLoan
    {
        $loan = EmployeeLoan::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'approved') {
            $data['approved_by'] = auth()->id();
            $data['status'] = 'active';
        }

        $loan->update($data);
        return $loan->load('employee', 'repayments');
    }
}
