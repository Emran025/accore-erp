<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PostPayrollIntegration;

class ProcessPostPayrollIntegrationAction
{
    public function execute(int $id): array
    {
        $integration = PostPayrollIntegration::findOrFail($id);
        
        if ($integration->status !== 'pending') {
            throw new \Exception('Integration already processed');
        }

        try {
            $integration->update([
                'status' => 'processing',
                'processed_by' => auth()->id(),
            ]);

            $fileName = $integration->integration_type . '_' . date('YmdHis') . '.txt';
            $integration->update([
                'file_path' => 'storage/payroll/' . $fileName,
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            return $integration->load('payrollCycle')->toArray();
        } catch (\Exception $e) {
            $integration->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            throw new \Exception('Processing failed: ' . $e->getMessage());
        }
    }
}
