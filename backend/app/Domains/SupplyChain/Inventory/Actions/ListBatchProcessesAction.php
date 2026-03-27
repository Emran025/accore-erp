<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use Illuminate\Pagination\LengthAwarePaginator;
class ListBatchProcessesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        $limit = $filters['per_page'] ?? $filters['limit'] ?? 20;

        return Batch::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($limit);
    }
}
