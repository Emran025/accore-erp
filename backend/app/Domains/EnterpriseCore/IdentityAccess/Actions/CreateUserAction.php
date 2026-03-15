<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\Hash;

class CreateUserAction
{
    public function execute(array $data): array
    {
        $user = User::create([
            'username'   => $data['username'],
            'password'   => Hash::make($data['password']),
            'full_name'  => $data['full_name'] ?? null,
            'role'       => $data['role'] ?? 'sales',
            'role_id'    => $data['role_id'] ?? null,
            'is_active'  => $data['is_active'] ?? true,
            'manager_id' => $data['manager_id'] ?? null,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);

        TelescopeService::logOperation('CREATE', 'users', $user->id, null, $data);

        return ['id' => $user->id];
    }
}
