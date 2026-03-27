<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;
use App\Domains\HumanCapital\PayrollBenefits\Models\PostPayrollIntegration;

class CreatePostPayrollIntegrationAction
{
    public function execute(array $data): PostPayrollIntegration
    {
        $payrollCycle = PayrollCycle::with('items')->findOrFail($data['payroll_cycle_id']);
        
        $totalAmount = 0;
        $transactionCount = 0;
        
        if ($data['integration_type'] === 'bank_file') {
            $totalAmount = $payrollCycle->items()->where('status', 'paid')->sum('net_pay');
            $transactionCount = $payrollCycle->items()->where('status', 'paid')->count();
        } elseif ($data['integration_type'] === 'gl_entry') {
            $totalAmount = $payrollCycle->items()->sum('gross_pay');
            $transactionCount = $payrollCycle->items()->count();
        }

        $data['status'] = 'pending';
        $data['total_amount'] = $totalAmount;
        $data['transaction_count'] = $transactionCount;

        return PostPayrollIntegration::create($data)->load('payrollCycle');
    }
}
