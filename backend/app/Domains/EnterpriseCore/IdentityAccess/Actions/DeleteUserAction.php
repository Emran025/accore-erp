<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;

class DeleteUserAction
{
    public function execute(int $id): void
    {
        $user = User::findOrFail($id);
        $oldValues = $user->toArray();
        $user->delete();

        TelescopeService::logOperation('DELETE', 'users', $id, $oldValues, null);
    }
}
