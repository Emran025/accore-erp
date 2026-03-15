<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
class ListBatchProcessesAction
{
    public function execute(array $filters): array
    {
        
        $page = $filters['page'] ?? 1;
        $limit = $filters['per_page'] ?? $filters['limit'] ?? 20;

        $batches = Batch::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return [
            'data' => $batches->items(),
            'total' => $batches->total(),
            'current_page' => $batches->currentPage(),
            'per_page' => $batches->perPage(),
        ];
    }
}
