<?php
namespace App\Domains\Finance\CostProfitCenters\Actions;

use App\Domains\Finance\CostProfitCenters\Models\ProfitCenter;
use App\Domains\EnterpriseCore\OrgIntegration\Services\OrgIntegrationService;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UpdateProfitCenterAction
{
    public function __construct(
        private readonly OrgIntegrationService $orgIntegration
    ) {}

    public function execute(array $data, int $id): void
    {
        PermissionService::requirePermission('chart_of_accounts', 'edit');

        $center = ProfitCenter::findOrFail($id);

        if (isset($data['parent_id']) && $data['parent_id'] == $id) {
            throw new \Exception('Cannot set the center as its own parent', 422);
        }

        DB::transaction(function () use ($center, $data) {
            $oldValues = $center->toArray();
            $center->update($data);

            // Mirror update to org-chart
            $this->orgIntegration->syncProfitCenterToOrgChart($center->fresh());

            TelescopeService::logOperation('UPDATE', 'profit_centers', $center->id, $oldValues, $data);
        });
    }
}
