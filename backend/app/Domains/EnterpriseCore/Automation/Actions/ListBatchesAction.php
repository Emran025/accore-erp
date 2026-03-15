<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
class ListBatchesAction
{
    public function execute(array $data): array
    {
        $page = $data['page'] ?? 1;
        $limit = $data['limit'] ?? 20;

        $batches = Batch::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return [
            'data' => $batches->items(),
            'meta' => [
                'total' => $batches->total(),
                'current_page' => $batches->currentPage(),
                'per_page' => $batches->perPage(),
                'last_page' => $batches->lastPage(),
            ],
        ];
    }
}
