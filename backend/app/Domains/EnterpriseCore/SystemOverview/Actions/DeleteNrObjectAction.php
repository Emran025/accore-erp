<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class DeleteNrObjectAction
{
    public function execute(int $id): bool
    {
        $object = NrObject::findOrFail($id);
        return $object->delete();
    }
}
