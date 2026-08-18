<?php

namespace App\Domains\EnterpriseCore\DesktopDistribution\Models;

use Illuminate\Database\Eloquent\Model;

class DesktopEnrollmentEvidence extends Model
{
    protected $table = 'desktop_enrollment_evidences';

    protected $fillable = [
        'token_hash',
        'label',
        'issued_by',
        'expires_at',
        'used_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function isUsableAt(\DateTimeInterface $now): bool
    {
        return $this->used_at === null
            && $this->revoked_at === null
            && $this->expires_at->isAfter($now);
    }
}
