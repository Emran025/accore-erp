<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class ListBatchProcessesAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('batch_processing', 'view');
        
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
