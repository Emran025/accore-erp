<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\ExpertiseDirectory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListExpertiseEntriesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $query = ExpertiseDirectory::with(['employee']);

        if (isset($filters['skill_name']) && $filters['skill_name'] !== '') {
            $query->where('skill_name', 'like', "%{$filters['skill_name']}%");
        }

        if (isset($filters['proficiency_level']) && $filters['proficiency_level'] !== '') {
            $query->where('proficiency_level', $filters['proficiency_level']);
        }

        if (isset($filters['is_available_for_projects']) && $filters['is_available_for_projects'] !== '') {
            $query->where(
                'is_available_for_projects',
                $filters['is_available_for_projects'] === 'true' || $filters['is_available_for_projects'] === true
            );
        }

        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
