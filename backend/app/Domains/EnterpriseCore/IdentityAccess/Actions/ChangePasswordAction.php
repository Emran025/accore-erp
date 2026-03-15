<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Support\Facades\Hash;

class ChangePasswordAction
{
    public function execute(array $data): array
    {
        $user = User::findOrFail(auth()->id() ?? session('user_id'));

        if (!Hash::check($data['current_password'], $user->password)) {
            return ['success' => false, 'error' => 'Current password is incorrect'];
        }

        $user->update(['password' => Hash::make($data['new_password'])]);

        return ['success' => true];
    }
}
