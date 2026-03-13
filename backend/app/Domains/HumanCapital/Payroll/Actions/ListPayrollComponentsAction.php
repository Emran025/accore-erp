<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;

class ListPayrollComponentsAction
{
    public function execute(): array
    {
        $components = PayrollComponent::orderBy('display_order')->orderBy('component_name')->get();
        return $components->toArray();
    }
}
