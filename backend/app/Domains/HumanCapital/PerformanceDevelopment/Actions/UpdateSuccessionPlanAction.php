<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;

class UpdateSuccessionPlanAction
{
    public function execute(SuccessionPlan $plan, array $data): SuccessionPlan
    {
        $plan->update($data);
        return $plan;
    }
}
