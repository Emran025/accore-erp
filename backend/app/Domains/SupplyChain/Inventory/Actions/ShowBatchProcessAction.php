<?php

namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;

class ShowBatchProcessAction
{
    public function execute(int $batchId): Batch
    {
        return Batch::with('items')->findOrFail($batchId);
    }
}
