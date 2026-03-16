<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class CreateNrGroupAction
{
    public function execute(int $objectId, array $data, ?int $userId = null): NrGroup
    {
        NrObject::findOrFail($objectId);

        return NrGroup::create([
            'nr_object_id' => $objectId,
            ...$data,
            'created_by' => $userId,
        ]);
    }
}
