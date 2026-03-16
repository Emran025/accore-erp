<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class CreateNrObjectAction
{
    public function execute(array $data, ?int $userId = null): NrObject
    {
        return NrObject::create([
            ...$data,
            'created_by' => $userId,
        ]);
    }
}
