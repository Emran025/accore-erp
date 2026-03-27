<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;


class ExecuteBatchAction
{
    public function execute(int $id): Batch
    {
        $batch = Batch::findOrFail($id);

        if ($batch->status !== 'pending') {
            throw new \Exception('الدفعات المعلقة فقط يمكن تنفيذها', 400);
        }

        $batch->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        // In a real system, this might trigger an async job.
        // For now, we simulate completion.
        $batch->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        TelescopeService::logOperation('EXECUTE', 'batch_processing', $id, ['status' => 'pending'], ['status' => 'completed']);

        return $batch->fresh();
    }
}
