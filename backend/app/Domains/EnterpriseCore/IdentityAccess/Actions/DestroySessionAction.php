<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Session;

class DestroySessionAction
{
    public function execute(int $id, int $userId, ?string $currentToken): array
    {
        $session = Session::where('id', $id)->where('user_id', $userId)->firstOrFail();

        if ($session->session_token === $currentToken) {
            return ['success' => false, 'error' => 'Cannot terminate current session here'];
        }

        $session->delete();

        return ['success' => true];
    }
}
