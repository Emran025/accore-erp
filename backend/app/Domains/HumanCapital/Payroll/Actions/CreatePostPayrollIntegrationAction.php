<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollCycle;
use App\Domains\HumanCapital\Payroll\Models\PostPayrollIntegration;

class CreatePostPayrollIntegrationAction
{
    public function execute(array $data): array
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

        $integration = PostPayrollIntegration::create($data);
        return $integration->load('payrollCycle')->toArray();
    }
}
