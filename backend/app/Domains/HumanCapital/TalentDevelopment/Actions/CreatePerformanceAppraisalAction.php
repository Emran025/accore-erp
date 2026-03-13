<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceAppraisal;

class CreatePerformanceAppraisalAction
{
    public function execute(array $data): array
    {
        $data['appraisal_number'] = 'APP-' . date('Ymd') . '-' . str_pad(PerformanceAppraisal::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';
        $data['ratings'] = $data['ratings'] ?? [];

        $appraisal = PerformanceAppraisal::create($data);
        return $appraisal->load('employee')->toArray();
    }
}
