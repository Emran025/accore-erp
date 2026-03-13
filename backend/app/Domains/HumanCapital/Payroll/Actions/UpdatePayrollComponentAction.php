<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;

class UpdatePayrollComponentAction
{
    public function execute(int|string $id, array $data): array
    {
        $component = PayrollComponent::findOrFail($id);
        $component->update($data);
        return current($component->toArray()) ?: reset($component);
    }
}
