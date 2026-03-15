<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\ExpertiseDirectory;

class UpdateExpertiseEntryAction
{
    public function execute(int $id, array $data): array
    {
        $expertise = ExpertiseDirectory::findOrFail($id);

        $expertise->update($data);

        return $expertise->load('employee')->toArray();
    }
}
