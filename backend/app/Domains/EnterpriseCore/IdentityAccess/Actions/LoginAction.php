<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Services\AuthService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class LoginAction
{
    public function __construct(private readonly AuthService $authService) {}

    public function execute(array $credentials): array
    {
        $result = $this->authService->login($credentials['username'], $credentials['password']);

        if (!$result['success']) {
            return ['success' => false, 'message' => $result['message']];
        }

        $user = User::with('roleRelation')->find($result['user_id']);
        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $userData = $this->buildUserSessionData($user);

        return [
            'success'     => true,
            'user'        => $userData,
            'token'       => $result['session_token'],
            'permissions' => $userData['permissions'],
        ];
    }

    private function buildUserSessionData(User $user): array
    {
        $permissionsMap = PermissionService::loadPermissions($user->role_id);

        $formattedPermissions = [];
        foreach ($permissionsMap as $module => $perms) {
            $formattedPermissions[] = [
                'module'     => $module,
                'can_view'   => (bool) ($perms['view'] ?? false),
                'can_create' => (bool) ($perms['create'] ?? false),
                'can_edit'   => (bool) ($perms['edit'] ?? false),
                'can_delete' => (bool) ($perms['delete'] ?? false),
            ];
        }

        return [
            'id'           => $user->id,
            'username'     => $user->username,
            'full_name'    => $user->full_name ?? $user->username,
            'role_id'      => $user->role_id,
            'role_key'     => $user->roleRelation?->role_key ?? $user->role ?? 'cashier',
            'role'         => $user->roleRelation?->role_key ?? $user->role ?? 'cashier',
            'role_name_ar' => $user->roleRelation?->role_name_ar,
            'role_name_en' => $user->roleRelation?->role_name_en,
            'permissions'  => $formattedPermissions,
        ];
    }
}
