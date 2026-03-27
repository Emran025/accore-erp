<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Session;
use Illuminate\Pagination\LengthAwarePaginator;
class ListSessionsAction
{
    /**
     * Get paginated session list for user.
     */
    public function execute(int $userId, int $limit = 10): LengthAwarePaginator
    {
        return Session::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($limit);
    }
}
