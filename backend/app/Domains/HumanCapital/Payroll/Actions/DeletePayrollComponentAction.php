<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;

class DeletePayrollComponentAction
{
    public function execute(int|string $id): void
    {
        $component = PayrollComponent::findOrFail($id);
        $component->delete();
    }
}
