<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class DeletePayrollComponentAction
{
    public function execute(int|string $id): void
    {
        $component = PayrollComponent::findOrFail($id);
        $component->delete();
    }
}
