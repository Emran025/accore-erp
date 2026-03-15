<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Session;

class ListMySessionsAction
{
    public function execute(): array
    {
        $userId = auth()->id() ?? session('user_id');
        $sessions = Session::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return ['sessions' => $sessions->toArray()];
    }
}
