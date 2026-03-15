<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class ShowPayrollComponentAction
{
    public function execute(int|string $id): array
    {
        $component = PayrollComponent::findOrFail($id);
        return $component->toArray();
    }
}
