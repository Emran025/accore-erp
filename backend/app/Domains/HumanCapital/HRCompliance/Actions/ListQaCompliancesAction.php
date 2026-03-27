<?php

namespace App\Domains\HumanCapital\HRCompliance\Actions;

use App\Domains\Manufacturing\QualityControl\Models\QaCompliance;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListQaCompliancesAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = QaCompliance::with(['employee', 'capas']);
        
        if (!empty($filters['compliance_type'])) {
            $query->where('compliance_type', $filters['compliance_type']);
        }
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }
        
        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
