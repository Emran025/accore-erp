<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\ProfitCenter;
use App\Domains\EnterpriseCore\OrganizationGovernance\Services\OrgIntegrationService;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateProfitCenterAction
{
    public function __construct(
        private readonly OrgIntegrationService $orgIntegration
    ) {}

    public function execute(array $data): ProfitCenter
    {
        PermissionService::requirePermission('chart_of_accounts', 'create');

        return DB::transaction(function () use ($data) {
            $center = ProfitCenter::create([
                ...$data,
                'type'       => $data['type'] ?? 'business_unit',
                'is_active'  => $data['is_active'] ?? true,
                'created_by' => auth()->id() ?? session('user_id'),
            ]);

            // Sync to org-chart
            $this->orgIntegration->syncProfitCenterToOrgChart($center);

            TelescopeService::logOperation('CREATE', 'profit_centers', $center->id, null, $data);

            return $center->fresh();
        });
    }
}
