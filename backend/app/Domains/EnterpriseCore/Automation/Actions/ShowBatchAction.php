<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;

class ShowBatchAction
{
    public function execute(int $id): Batch
    {
        return Batch::with('items')->findOrFail($id);
    }
}
