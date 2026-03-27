<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PostPayrollIntegration;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListPostPayrollIntegrationsAction
{
    public function execute(array $filters): LengthAwarePaginator
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
        
        return $query->orderBy('created_at', 'desc')->paginate(15);
    }
}
