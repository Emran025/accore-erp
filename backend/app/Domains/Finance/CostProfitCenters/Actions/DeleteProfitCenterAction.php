<?php
namespace App\Domains\Finance\CostProfitCenters\Actions;

use App\Domains\Finance\CostProfitCenters\Models\ProfitCenter;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\OrgStructure\Models\StructureNode;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Support\Facades\DB;

use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class DeleteProfitCenterAction
{
    public function execute(int $id): void
    {
        PermissionService::requirePermission('chart_of_accounts', 'delete');

        $center = ProfitCenter::findOrFail($id);

        $glCount = GeneralLedger::where('profit_center_id', $id)->count();
        if ($glCount > 0) {
            throw new \Exception("Cannot delete profit center: {$glCount} accounting entries exist", 422);
        }

        if ($center->children()->count() > 0) {
            throw new \Exception('Cannot delete profit center with children', 422);
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

            TelescopeService::logOperation('DELETE', 'profit_centers', $id, $oldValues, null);
        });
    }
}
