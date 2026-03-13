<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\RecruitmentRequisition;

class UpdateRequisitionAction
{
    public function execute(int|string $id, array $data): array
    {
        $requisition = RecruitmentRequisition::findOrFail($id);

        if (array_key_exists('approved_by', $data) && isset($data['status']) && $data['status'] === 'approved') {
            $data['approved_by'] = auth()->id();
            $data['approved_at'] = now();
        }

        $requisition->update($data);
        return $requisition->load('department', 'role')->toArray();
    }
}
