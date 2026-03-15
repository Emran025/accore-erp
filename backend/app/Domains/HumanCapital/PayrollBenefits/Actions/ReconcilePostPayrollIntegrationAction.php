<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PostPayrollIntegration;

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
