<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;
use Illuminate\Database\Eloquent\Collection;

class ListPayrollComponentsAction
{
    public function execute(): Collection
    {
        return PayrollComponent::orderBy('display_order')->orderBy('component_name')->get();
    }
}
