<?php

namespace App\Domains\EnterpriseCore\IAM\Models;

use Illuminate\Database\Eloquent\Model;

class PermissionTemplate extends Model
{
    protected $fillable = [
        'template_name', 'template_key', 'description', 'permissions',
        'is_active', 'created_by'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
