<?php

namespace App\Domains\HumanCapital\HRCompliance\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class KnowledgeBase extends Model
{
    use SoftDeletes;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

    protected $table = 'knowledge_base';

    protected $fillable = [
        'title', 'content', 'category', 'tags', 'file_path', 'view_count',
        'helpful_count', 'is_published', 'created_by'
    ];

    protected $casts = [
        'tags' => 'array',
        'view_count' => 'integer',
        'helpful_count' => 'integer',
        'is_published' => 'boolean',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

