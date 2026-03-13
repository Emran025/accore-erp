<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\PpeManagement;

class CreatePpeAction
{
    public function execute(array $data): array
    {
        $data['status'] = 'issued';

        $ppe = PpeManagement::create($data);

        return $ppe->load('employee')->toArray();
    }
}
