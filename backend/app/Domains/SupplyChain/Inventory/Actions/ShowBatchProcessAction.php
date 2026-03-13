<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ShowBatchProcessAction
{
    public function execute(int $batchId): array
    {
        PermissionService::requirePermission('batch_processing', 'view');
        
        $batch = Batch::with('items')->findOrFail($batchId);

        return $batch->toArray();
    }
}
