<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;

class ShowSuccessionPlanAction
{
    public function execute(int $id): SuccessionPlan
    {
        return SuccessionPlan::with(['incumbent', 'candidates.employee'])->findOrFail($id);
    }
}
