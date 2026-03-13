<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\User;

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
