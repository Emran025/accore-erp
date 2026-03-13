<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\Session;

class ListSessionsAction
{
    public function execute(int $userId, ?string $currentToken, int $limit = 10): array
    {
        $sessionsQuery = Session::where('user_id', $userId)->orderBy('created_at', 'desc');
        $total = $sessionsQuery->count();
        $sessions = $sessionsQuery->paginate($limit);

        $mappedSessions = collect($sessions->items())->map(fn($session) => [
            'id'            => $session->id,
            'device'        => $this->parseUserAgent($session->user_agent),
            'ip_address'    => $session->ip_address,
            'last_activity' => $session->created_at,
            'is_current'    => $session->session_token === $currentToken,
        ]);

        return [
            'sessions' => $mappedSessions,
            'total'    => $total,
        ];
    }

    private function parseUserAgent($ua): string
    {
        if (empty($ua)) return 'Unknown Device';
        if (str_contains($ua, 'Mobi')) return 'Mobile Device';
        if (str_contains($ua, 'Tablet')) return 'Tablet';
        if (str_contains($ua, 'Windows')) return 'Windows PC';
        if (str_contains($ua, 'Macintosh')) return 'Mac';
        if (str_contains($ua, 'Linux')) return 'Linux PC';
        return 'Desktop Device';
    }
}
