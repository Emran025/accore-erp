<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class ListPayrollComponentsAction
{
    public function execute(): array
    {
        $components = PayrollComponent::orderBy('display_order')->orderBy('component_name')->get();
        return $components->toArray();
    }
}
