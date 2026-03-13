<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrgIntegration;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\SyncCostCenterAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\SyncProfitCenterAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\SyncNodeToTableAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\OpenCenterAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\CloseCenterAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\SyncJobTitleAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\GetJobTitleMappingAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\BulkSyncCostCentersAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\BulkSyncProfitCentersAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\BulkSyncNodesToTablesAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\BulkSyncJobTitlesAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\GetIntegrationStatusAction;
use App\Domains\EnterpriseCore\OrgIntegration\Actions\GetIntegrationIssuesAction;
use App\Http\Requests\EnterpriseCore\OrgIntegration\OpenCloseCenterRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class OrgIntegrationController extends Controller
{
    use BaseApiController;

    public function __construct() {}

    // ═══════════════════════════════════════════════════════════════════
    // COST / PROFIT CENTRE ↔ ORG CHART
    // ═══════════════════════════════════════════════════════════════════

    public function syncCostCenter(int $id, SyncCostCenterAction $action): JsonResponse
    {
        $result = $action->execute($id);

        return $this->successResponse($result, 'تم مزامنة مركز التكلفة مع الهيكل التنظيمي');
    }

    public function syncProfitCenter(int $id, SyncProfitCenterAction $action): JsonResponse
    {
        $result = $action->execute($id);

        return $this->successResponse($result, 'تم مزامنة مركز الربح مع الهيكل التنظيمي');
    }

    public function syncNodeToTable(string $uuid, SyncNodeToTableAction $action): JsonResponse
    {
        try {
            $result = $action->execute($uuid);
            $msg = $result['type'] === 'cost_center' 
                 ? 'تم مزامنة عقدة الهيكل التنظيمي مع مركز التكلفة'
                 : 'تم مزامنة عقدة الهيكل التنظيمي مع مركز الربح';
            return $this->successResponse($result, $msg);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // OPEN / CLOSE CENTRES
    // ═══════════════════════════════════════════════════════════════════

    public function openCenter(OpenCloseCenterRequest $request, OpenCenterAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($validated['type'], $validated['id']);

        return $this->successResponse($result, 'تم فتح المركز بنجاح');
    }

    public function closeCenter(OpenCloseCenterRequest $request, CloseCenterAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $result = $action->execute($validated['type'], $validated['id']);
            return $this->successResponse($result, 'تم إغلاق المركز بنجاح');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // JOB TITLE SYNC
    // ═══════════════════════════════════════════════════════════════════

    public function syncJobTitle(int $id, SyncJobTitleAction $action): JsonResponse
    {
        $result = $action->execute($id);

        return $this->successResponse($result, 'تم مزامنة المسمى الوظيفي مع المناصب والموظفين');
    }

    public function jobTitleMapping(int $id, GetJobTitleMappingAction $action): JsonResponse
    {
        $mapping = $action->execute($id);

        return $this->successResponse($mapping);
    }

    // ═══════════════════════════════════════════════════════════════════
    // BULK SYNC
    // ═══════════════════════════════════════════════════════════════════

    public function bulkSyncCostCenters(BulkSyncCostCentersAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result, 'تم مزامنة جميع مراكز التكلفة');
    }

    public function bulkSyncProfitCenters(BulkSyncProfitCentersAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result, 'تم مزامنة جميع مراكز الربح');
    }

    public function bulkSyncNodesToTables(BulkSyncNodesToTablesAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result, 'تم مزامنة عقد الهيكل التنظيمي مع الجداول');
    }

    public function bulkSyncJobTitles(BulkSyncJobTitlesAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result, 'تم مزامنة جميع المسميات الوظيفية');
    }

    // ═══════════════════════════════════════════════════════════════════
    // INTEGRATION STATUS / DASHBOARD
    // ═══════════════════════════════════════════════════════════════════

    public function status(GetIntegrationStatusAction $action): JsonResponse
    {
        $status = $action->execute();
        return $this->successResponse($status);
    }

    public function issues(GetIntegrationIssuesAction $action): JsonResponse
    {
        $issues = $action->execute();
        return $this->successResponse($issues);
    }
}
