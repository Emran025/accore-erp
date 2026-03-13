<?php

namespace App\Domains\HumanCapital\Communications\Actions;

use App\Domains\HumanCapital\Communications\Models\ExpertiseDirectory;

class UpdateExpertiseEntryAction
{
    public function execute(int $id, array $data): array
    {
        $expertise = ExpertiseDirectory::findOrFail($id);

        $expertise->update($data);

        return $expertise->load('employee')->toArray();
    }
}
