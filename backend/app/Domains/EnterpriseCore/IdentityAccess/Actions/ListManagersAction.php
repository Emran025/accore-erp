<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class ListManagersAction
{
    public function execute(): array
    {
        return User::where('role', 'manager')
            ->orWhere('role', 'admin')
            ->get(['id', 'username'])
            ->toArray();
    }
}
