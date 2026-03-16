<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\TalentRecruitment\Models\RecruitmentRequisition;
use Illuminate\Pagination\LengthAwarePaginator;
class ListRequisitionsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = RecruitmentRequisition::with(['department', 'role']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
