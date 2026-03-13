<?php
namespace App\Domains\Finance\CostProfitCenters\Actions;

use App\Domains\Finance\CostProfitCenters\Models\CostCenter;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class CreateCostCenterAction
{
    public function __construct(
        private readonly OrgIntegrationService $orgIntegration
    ) {}

    public function execute(array $data): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'create');

        $result = DB::transaction(function () use ($data) {
            $center = CostCenter::create([
                ...$data,
                'type'       => $data['type'] ?? 'operational',
                'is_active'  => $data['is_active'] ?? true,
                'created_by' => auth()->id() ?? session('user_id'),
            ]);

            // Sync to org-chart
            $node = $this->orgIntegration->syncCostCenterToOrgChart($center);

            TelescopeService::logOperation('CREATE', 'cost_centers', $center->id, null, $data);

            return ['center' => $center->fresh(), 'node_uuid' => $node->node_uuid];
        });

        return [
            'id'        => $result['center']->id,
            'node_uuid' => $result['node_uuid'],
            'center'    => $result['center']->toArray(),
        ];
    }
}
