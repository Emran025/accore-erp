<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use Illuminate\Pagination\LengthAwarePaginator;
class ListBatchesAction
{
    public function execute(array $data): LengthAwarePaginator
    {
        $page = $data['page'] ?? 1;
        $limit = $data['limit'] ?? 20;

        return Batch::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);
    }
}
