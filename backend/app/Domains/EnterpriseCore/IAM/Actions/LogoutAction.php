<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Services\AuthService;

class LogoutAction
{
    public function __construct(private readonly AuthService $authService) {}

    public function execute(?string $sessionToken): void
    {
        if ($sessionToken) {
            $this->authService->logout($sessionToken);
        }

        session()->flush();
    }
}
