<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;

class DeleteNrGroupAction
{
    public function execute(int $groupId): bool
    {
        $group = NrGroup::findOrFail($groupId);
        return $group->delete();
    }
}
