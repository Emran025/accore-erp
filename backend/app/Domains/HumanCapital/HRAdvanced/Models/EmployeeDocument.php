<?php

namespace App\Domains\HumanCapital\HRAdvanced\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDocument extends Model
{
    protected $fillable = [
        'employee_id', 'document_type', 'document_name', 'document_number',
        'issue_date', 'expiration_date', 'status', 'file_path', 'mime_type', 
        'file_size', 'notes', 'is_verified', 'verified_by', 'verified_at', 'uploaded_by'
    ];

    public function employee() {
        return $this->belongsTo(Employee::class);
    }

    public function uploader() {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
    
    public function verifier() {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
