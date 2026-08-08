<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class WellnessProgram extends Model
{
    protected $fillable = [
        'program_name', 'description', 'program_type', 'start_date', 'end_date',
        'is_active', 'target_metrics', 'created_by'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'target_metrics' => 'array',
        'is_active' => 'boolean',
    ];

    public function participations()
    {
        return $this->hasMany(WellnessParticipation::class, 'program_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

