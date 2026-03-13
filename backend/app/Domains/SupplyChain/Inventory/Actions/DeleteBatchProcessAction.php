<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class DeleteBatchProcessAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('batch_processing', 'delete');

        $batch = Batch::findOrFail($id);

        if ($batch->status === 'processing') {
            throw new \Exception('لا يمكن حذف دفعة قيد المعالجة', 400);
        }

        $oldValues = $batch->toArray();
        $batch->delete();

        TelescopeService::logOperation('DELETE', 'batch_processing', $id, $oldValues, null);
    }
}
