<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class ListUsersAction
{
    public function execute(): array
    {
        return User::with(['roleRelation', 'manager', 'createdBy'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn($user) => [
                'id'           => $user->id,
                'username'     => $user->username,
                'full_name'    => $user->full_name,
                'role'         => $user->roleRelation?->role_key ?? $user->role,
                'role_id'      => $user->role_id,
                'is_active'    => $user->is_active,
                'manager_id'   => $user->manager_id,
                'manager_name' => $user->manager?->username,
                'created_by'   => $user->created_by,
                'creator_name' => $user->createdBy?->username,
                'created_at'   => $user->created_at,
            ])
            ->toArray();
    }
}
