<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\SuccessionPlan;

class CreateSuccessionPlanAction
{
    public function execute(array $data): SuccessionPlan
    {
        $data['status'] = 'active';
        $data['created_by'] = auth()->id();

        return SuccessionPlan::create($data);
    }
}
