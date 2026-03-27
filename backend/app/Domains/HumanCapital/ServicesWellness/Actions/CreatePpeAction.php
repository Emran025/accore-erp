<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\PpeManagement;

class CreatePpeAction
{
    public function execute(array $data): PpeManagement
    {
        $data['status'] = 'issued';

        return PpeManagement::create($data)->load('employee');
    }
}
