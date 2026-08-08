<?php

namespace App\Domains\HumanCapital\TimeProductivity\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class BiometricSyncLog extends Model
{
    protected $fillable = [
        'device_id', 'sync_type', 'records_imported', 'records_failed',
        'status', 'error_message', 'initiated_by', 'started_at', 'completed_at'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'records_imported' => 'integer',
        'records_failed' => 'integer',
    ];

    public function device()
    {
        return $this->belongsTo(BiometricDevice::class, 'device_id');
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }
}
