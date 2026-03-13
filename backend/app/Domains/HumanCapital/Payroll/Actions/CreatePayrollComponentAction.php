<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;

class CreatePayrollComponentAction
{
    public function execute(array $data): array
    {
        $component = PayrollComponent::create($data);
        return current($component->toArray()) ?: reset($component);
    }
}
