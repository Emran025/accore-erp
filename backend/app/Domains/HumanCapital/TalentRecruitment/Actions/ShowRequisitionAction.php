<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\RecruitmentRequisition;

class ShowRequisitionAction
{
    public function execute(int|string $id): RecruitmentRequisition
    {
        return RecruitmentRequisition::with(['department', 'role', 'applicants'])->findOrFail($id);
    }
}
