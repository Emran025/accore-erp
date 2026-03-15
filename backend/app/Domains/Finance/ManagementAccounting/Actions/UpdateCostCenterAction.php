<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateCostCenterAction
{
    public function __construct(
        private readonly OrgIntegrationService $orgIntegration
    ) {}

    public function execute(array $data, int $id): void
    {
        PermissionService::requirePermission('chart_of_accounts', 'edit');

        $center = CostCenter::findOrFail($id);

        // Prevent circular parent references
        if (isset($data['parent_id']) && $data['parent_id'] == $id) {
            throw new \Exception('Cannot set the center as its own parent', 422);
        }

        DB::transaction(function () use ($center, $data) {
            $oldValues = $center->toArray();
            $center->update($data);

            // Mirror update to org-chart
            $this->orgIntegration->syncCostCenterToOrgChart($center->fresh());

            TelescopeService::logOperation('UPDATE', 'cost_centers', $center->id, $oldValues, $data);
        });
    }
}
