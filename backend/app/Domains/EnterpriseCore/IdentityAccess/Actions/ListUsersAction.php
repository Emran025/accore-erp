<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ListUsersAction
{
    public function execute(): Collection
    {
        return User::with(['roleRelation', 'manager', 'createdBy'])
            ->orderBy('id', 'desc')
            ->get();
    }
}
