<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\RecruitmentRequisition;

class ShowRequisitionAction
{
    public function execute(int|string $id): array
    {
        $requisition = RecruitmentRequisition::with(['department', 'role', 'applicants'])->findOrFail($id);
        return $requisition->toArray();
    }
}
