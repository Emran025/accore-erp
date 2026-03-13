<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\User;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\Hash;

class UpdateUserAction
{
    public function execute(array $data): void
    {
        $user = User::findOrFail($data['id']);
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
    }
}
