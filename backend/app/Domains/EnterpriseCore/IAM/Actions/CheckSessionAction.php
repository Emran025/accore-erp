<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Services\AuthService;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class CheckSessionAction
{
    public function __construct(private readonly AuthService $authService) {}

    public function execute(?string $sessionToken): array
    {
        $user = $this->authService->checkSession($sessionToken);

        if (!$user) {
            return ['success' => false, 'message' => 'Unauthorized'];
        }

        $userData = $this->buildUserSessionData($user);

        return [
            'success'       => true,
            'user'          => $userData,
            'permissions'   => $userData['permissions'],
            'authenticated' => true,
        ];
    }

    private function buildUserSessionData($user): array
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
