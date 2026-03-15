<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class CreatePayrollComponentAction
{
    public function execute(array $data): array
    {
        $component = PayrollComponent::create($data);
        return current($component->toArray()) ?: reset($component);
    }
}
