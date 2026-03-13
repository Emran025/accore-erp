<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PostPayrollIntegration;

class ReconcilePostPayrollIntegrationAction
{
    public function execute(int $id, array $data): array
    {
        $integration = PostPayrollIntegration::findOrFail($id);
        
        $integration->update([
            'status' => 'reconciled',
            'reconciled_at' => now(),
        ]);

        return $integration->load('payrollCycle')->toArray();
    }
}
