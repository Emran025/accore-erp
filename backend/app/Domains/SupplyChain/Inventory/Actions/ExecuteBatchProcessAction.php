<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

class ExecuteBatchProcessAction
{
    public function execute(int $batchId): void
    {
        PermissionService::requirePermission('batch_processing', 'execute');
        
        $batch = Batch::findOrFail($batchId);
        
        if ($batch->status !== 'pending') {
            throw new \Exception('الدفعات المعلقة فقط يمكن تنفيذها', 400);
        }

        // Mark as processing
        $batch->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        // Mocking execution result
        $batch->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        TelescopeService::logOperation('EXECUTE', 'batch_processing', $batchId, ['status' => 'pending'], ['status' => 'completed']);
    }
}
