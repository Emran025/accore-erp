<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\TalentAcquisition\Models\RecruitmentRequisition;

class ListRequisitionsAction
{
    public function execute(array $filters = []): array
    {
        $query = RecruitmentRequisition::with(['department', 'role']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
