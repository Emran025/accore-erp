<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\RecruitmentRequisition;

class CreateRequisitionAction
{
    public function execute(array $data): array
    {
        $data['requisition_number'] = 'REQ-' . date('Ymd') . '-' . str_pad(RecruitmentRequisition::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';
        $data['requested_by'] = auth()->id();
        $data['is_published'] = false;

        $requisition = RecruitmentRequisition::create($data);
        return $requisition->load('department', 'role')->toArray();
    }
}
