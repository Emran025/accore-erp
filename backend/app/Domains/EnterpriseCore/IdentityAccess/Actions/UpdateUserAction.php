<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\Hash;

class UpdateUserAction
{
    public function execute(int|string $id, array $data): User
    {
        $user = User::findOrFail($id);
        $oldValues = $user->toArray();

        $updateData = [
            'username'   => $data['username'],
            'full_name'  => $data['full_name'] ?? null,
            'role'       => $data['role'] ?? $user->role,
            'role_id'    => $data['role_id'] ?? null,
            'is_active'  => $data['is_active'] ?? $user->is_active,
            'manager_id' => $data['manager_id'] ?? null,
        ];

        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        TelescopeService::logOperation('UPDATE', 'users', $user->id, $oldValues, $updateData);

        return $user;
    }
}
