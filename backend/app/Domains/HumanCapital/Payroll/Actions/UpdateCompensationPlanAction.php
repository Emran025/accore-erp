<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\CompensationPlan;

class UpdateCompensationPlanAction
{
    public function execute(int|string $id, array $data): array
    {
        $plan = CompensationPlan::findOrFail($id);

        if (isset($data['status']) && $data['status'] === 'approved' && !$plan->approved_by) {
            $data['approved_by'] = auth()->id();
        }

        $plan->update($data);

        // Recalculate allocated amount
        $allocated = $plan->entries()->sum('increase_amount');
        $plan->update(['allocated_amount' => $allocated]);

        return $plan->load('entries.employee')->toArray();
    }
}
