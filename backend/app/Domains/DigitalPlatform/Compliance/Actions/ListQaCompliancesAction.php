<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\Manufacturing\Models\QaCompliance;

class ListQaCompliancesAction
{
    public function execute(array $filters = []): array
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
        
        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
