<?php

namespace App\Domains\EnterpriseCore\DesktopDistribution\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DesktopDistributionAuditEvent extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'desktop_device_id',
        'event_type',
        'outcome',
        'ip_address',
        'context',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(DesktopDevice::class, 'desktop_device_id');
    }
}
