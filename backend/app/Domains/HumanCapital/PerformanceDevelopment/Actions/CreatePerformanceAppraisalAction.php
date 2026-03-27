<?php

namespace App\Domains\HumanCapital\PerformanceDevelopment\Actions;

use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceAppraisal;

class CreatePerformanceAppraisalAction
{
    public function execute(array $data): PerformanceAppraisal
    {
        $data['appraisal_number'] = 'APP-' . date('Ymd') . '-' . str_pad(PerformanceAppraisal::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';
        $data['ratings'] = $data['ratings'] ?? [];

        $appraisal = PerformanceAppraisal::create($data);
        return $appraisal->load('employee');
    }
}
