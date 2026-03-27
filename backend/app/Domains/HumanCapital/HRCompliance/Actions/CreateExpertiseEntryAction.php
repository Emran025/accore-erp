<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\ExpertiseDirectory;

class CreateExpertiseEntryAction
{
    public function execute(array $data): ExpertiseDirectory
    {
        $data['is_available_for_projects'] = $data['is_available_for_projects'] ?? true;

        $expertise = ExpertiseDirectory::create($data);

        return $expertise->load('employee');
    }
}
