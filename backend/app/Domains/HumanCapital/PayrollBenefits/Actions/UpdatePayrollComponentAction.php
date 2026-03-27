<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class UpdatePayrollComponentAction
{
    public function execute(int|string $id, array $data): PayrollComponent
    {
        $component = PayrollComponent::findOrFail($id);
        $component->update($data);
        return $component->fresh();
    }
}
