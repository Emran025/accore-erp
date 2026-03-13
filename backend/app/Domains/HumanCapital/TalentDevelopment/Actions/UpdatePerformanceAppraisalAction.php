<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceAppraisal;

class UpdatePerformanceAppraisalAction
{
    public function execute(int|string $id, array $data): array
    {
        $appraisal = PerformanceAppraisal::findOrFail($id);
        $appraisal->update($data);
        return $appraisal->load('employee')->toArray();
    }
}
