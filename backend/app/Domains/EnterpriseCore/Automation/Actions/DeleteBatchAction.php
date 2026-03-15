<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;


class DeleteBatchAction
{
    public function execute(int $id): void
    {
        $batch = Batch::findOrFail($id);

        if ($batch->status === 'processing') {
            throw new \Exception('لا يمكن حذف دفعة قيد المعالجة', 400);
        }

        $oldValues = $batch->toArray();
        $batch->delete();

        TelescopeService::logOperation('DELETE', 'batch_processing', $id, $oldValues, null);
    }
}
