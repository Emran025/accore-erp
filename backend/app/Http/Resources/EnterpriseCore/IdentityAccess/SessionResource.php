<?php

namespace App\Http\Resources\EnterpriseCore\IdentityAccess;

use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'user_id'       => $this->user_id,
            'ip_address'    => $this->ip_address,
            'device'        => $this->parseUserAgent($this->user_agent),
            'user_agent'    => $this->user_agent,
            'is_current'    => $this->session_token === $request->header('X-Session-Token'),
            'last_activity' => $this->created_at?->toDateTimeString(),
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
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
