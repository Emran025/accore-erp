<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\CompensationEntry;
use App\Domains\HumanCapital\Payroll\Models\CompensationPlan;

class CreateCompensationEntryAction
{
    public function execute(array $data): array
    {
        $data['increase_amount'] = $data['proposed_salary'] - $data['current_salary'];
        $data['increase_percentage'] = $data['current_salary'] > 0
            ? round(($data['increase_amount'] / $data['current_salary']) * 100, 2)
            : 0;
        $data['status'] = 'pending';

        $entry = CompensationEntry::create($data);

        // Update plan allocated amount
        $plan = CompensationPlan::findOrFail($data['compensation_plan_id']);
        $plan->update(['allocated_amount' => $plan->entries()->sum('increase_amount')]);

        return $entry->load('plan', 'employee')->toArray();
    }
}
