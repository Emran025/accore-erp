<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\JobApplicant;

class ListJobApplicantsAction
{
    public function execute(array $filters = []): array
    {
        $query = JobApplicant::with(['requisition']);

        if (!empty($filters['requisition_id'])) {
            $query->where('requisition_id', $filters['requisition_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('application_date', 'desc')->paginate(15)->toArray();
    }
}
