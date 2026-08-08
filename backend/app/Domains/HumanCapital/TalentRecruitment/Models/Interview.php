<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class Interview extends Model
{
    protected $fillable = [
        'applicant_id', 'interviewer_id', 'interview_type', 'scheduled_at', 'completed_at',
        'status', 'rating', 'feedback', 'notes', 'location', 'meeting_link'
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'rating' => 'integer',
    ];

    public function applicant()
    {
        return $this->belongsTo(JobApplicant::class, 'applicant_id');
    }

    public function interviewer()
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }
}

