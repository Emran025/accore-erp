<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;

class UpdateNrGroupAction
{
    public function execute(int $groupId, array $data): bool
    {
        $group = NrGroup::findOrFail($groupId);
        return $group->update($data);
    }
}
