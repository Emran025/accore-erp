<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PostPayrollIntegration;

class ListPostPayrollIntegrationsAction
{
    public function execute(array $filters): array
    {
        $query = PostPayrollIntegration::with(['payrollCycle']);
        
        if (isset($filters['payroll_cycle_id'])) {
            $query->where('payroll_cycle_id', $filters['payroll_cycle_id']);
        }
        
        if (isset($filters['integration_type'])) {
            $query->where('integration_type', $filters['integration_type']);
        }
        
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
