<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceAppraisal;

class UpdatePerformanceAppraisalAction
{
    public function execute(int|string $id, array $data): PerformanceAppraisal
    {
        $appraisal = PerformanceAppraisal::findOrFail($id);
        $appraisal->update($data);
        return $appraisal->load('employee');
    }
}
