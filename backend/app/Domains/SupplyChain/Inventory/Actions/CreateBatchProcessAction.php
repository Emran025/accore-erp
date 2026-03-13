<?php
namespace App\Domains\SupplyChain\Inventory\Actions;

use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class CreateBatchProcessAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('batch_processing', 'create');

        $batch = Batch::create([
            'batch_name' => $data['batch_name'],
            'batch_type' => $data['batch_type'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
            'total_items' => 0,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);

        TelescopeService::logOperation('CREATE', 'batch_processing', $batch->id, null, $data);

        return $batch->toArray();
    }
}
