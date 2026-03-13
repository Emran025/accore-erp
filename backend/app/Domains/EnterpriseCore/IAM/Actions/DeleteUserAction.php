<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\User;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

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
