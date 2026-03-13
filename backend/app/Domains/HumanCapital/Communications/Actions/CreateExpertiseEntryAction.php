<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\ExpertiseDirectory;

class CreateExpertiseEntryAction
{
    public function execute(array $data): array
    {
        $data['is_available_for_projects'] = $data['is_available_for_projects'] ?? true;

        $expertise = ExpertiseDirectory::create($data);

        return $expertise->load('employee')->toArray();
    }
}
