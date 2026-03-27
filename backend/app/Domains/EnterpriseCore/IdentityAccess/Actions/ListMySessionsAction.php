<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Session;
use Illuminate\Database\Eloquent\Collection;

class ListMySessionsAction
{
    public function execute(): Collection
    {
        $userId = auth()->id() ?? session('user_id');
        return Session::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
