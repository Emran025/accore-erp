<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class UpdateNrObjectAction
{
    public function execute(int $id, array $data): bool
    {
        $object = NrObject::findOrFail($id);
        return $object->update($data);
    }
}
