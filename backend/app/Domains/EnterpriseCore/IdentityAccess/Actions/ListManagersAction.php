<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListManagersAction
{
    public function execute(): Collection
    {
        return User::where('role', 'manager')
            ->orWhere('role', 'admin')
            ->get();
    }
}
