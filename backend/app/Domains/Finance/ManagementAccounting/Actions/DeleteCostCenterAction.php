<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\CostCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class DeleteCostCenterAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('chart_of_accounts', 'delete');

        $center = CostCenter::findOrFail($id);

        // Guard: prevent deletion if GL entries reference this centre
        $glCount = GeneralLedger::where('cost_center_id', $id)->count();
        if ($glCount > 0) {
            throw new \Exception("Cannot delete cost center: {$glCount} accounting entries exist", 422);
        }

        // Guard: prevent deletion if has children
        if ($center->children()->count() > 0) {
            throw new \Exception('Cannot delete cost center with children', 422);
        }

        DB::transaction(function () use ($center, $id) {
            $oldValues = $center->toArray();

            // Archive the org-chart node
            if ($center->structure_node_uuid) {
                $node = StructureNode::find($center->structure_node_uuid);
                if ($node) {
                    $node->update([
                        'status' => 'archived',
                        'updated_by' => auth()->id() ?? session('user_id')
                    ]);
                }
            }

            $center->delete();

            TelescopeService::logOperation('DELETE', 'cost_centers', $id, $oldValues, null);
        });
    }
}
