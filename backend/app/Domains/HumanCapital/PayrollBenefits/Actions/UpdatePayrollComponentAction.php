<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;

class UpdatePayrollComponentAction
{
    public function execute(int|string $id, array $data): array
    {
        $component = PayrollComponent::findOrFail($id);
        $component->update($data);
        return current($component->toArray()) ?: reset($component);
    }
}
