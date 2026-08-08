<?php

namespace App\Domains\Manufacturing\QualityControl\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

class Capa extends Model
{
    use SoftDeletes;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;

    protected $fillable = [
        'capa_number', 'compliance_id', 'employee_id', 'type', 'issue_description',
        'root_cause', 'action_plan', 'status', 'target_date', 'completed_date',
        'verification', 'assigned_to', 'completed_by', 'notes'
    ];

    protected $casts = [
        'target_date' => 'date',
        'completed_date' => 'date',
    ];

    public function compliance()
    {
        return $this->belongsTo(QaCompliance::class, 'compliance_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}

