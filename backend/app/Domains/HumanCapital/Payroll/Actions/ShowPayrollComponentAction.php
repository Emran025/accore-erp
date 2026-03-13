<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;

class ShowPayrollComponentAction
{
    public function execute(int|string $id): array
    {
        $component = PayrollComponent::findOrFail($id);
        return $component->toArray();
    }
}
