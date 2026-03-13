<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\RecruitmentRequisition;

class ShowRequisitionAction
{
    public function execute(int|string $id): array
    {
        $requisition = RecruitmentRequisition::with(['department', 'role', 'applicants'])->findOrFail($id);
        return $requisition->toArray();
    }
}
