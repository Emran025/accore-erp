<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Models;

use App\Domains\EnterpriseCore\DesktopDistribution\Models\DesktopDevice;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends Model
{
    protected $fillable = [
        'user_id',
        'desktop_device_id',
        'session_token',
        'refresh_token_hash',
        'ip_address',
        'user_agent',
        'expires_at',
        'refresh_expires_at',
        'revoked_at',
        'revocation_reason',
    ];

    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'refresh_expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function desktopDevice(): BelongsTo
    {
        return $this->belongsTo(DesktopDevice::class);
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }
}
