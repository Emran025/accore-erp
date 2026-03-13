<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrgStructure;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrgStructure\BulkStatusUpdateRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\StoreLinkRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\StoreNodeRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\UpdateLinkRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\UpdateNodeRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\ListMetaTypesRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\ListNodesRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\ListLinksRequest;
use App\Http\Requests\EnterpriseCore\OrgStructure\GetChangeHistoryRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ListMetaTypesAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ListTopologyRulesAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ListStructureNodesAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ShowStructureNodeAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\CreateStructureNodeAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\UpdateStructureNodeAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\DeleteStructureNodeAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ListStructureLinksAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\CreateStructureLinkAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\UpdateStructureLinkAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\DeleteStructureLinkAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\ResolveScopeContextAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\GetOrgStatisticsAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\RunIntegrityCheckAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\GetOrgChangeHistoryAction;
use App\Domains\EnterpriseCore\OrgStructure\Actions\BulkUpdateNodeStatusAction;

/**
 * Organizational Structure Configuration Engine API.
 * SAP SPRO-style: Definition (nodes) and Assignment (links).
 */
class OrgStructureController extends Controller
{
    use BaseApiController;

    public function __construct()
    {
    }

    // ─── Meta Types ─────────────────────────────────────────────────────

    public function metaTypes(ListMetaTypesRequest $request, ListMetaTypesAction $action): JsonResponse
    {
        $types = $action->execute($request->validated());
        return $this->successResponse(['meta_types' => $types]);
    }

    // ─── Topology Rules ─────────────────────────────────────────────────

    public function topologyRules(ListTopologyRulesAction $action): JsonResponse
    {
        $rules = $action->execute();
        return $this->successResponse(['topology_rules' => $rules]);
    }

    // ─── Nodes ──────────────────────────────────────────────────────────

    public function nodes(ListNodesRequest $request, ListStructureNodesAction $action): JsonResponse
    {
        try {
            $nodes = $action->execute($request->validated());
            return $this->successResponse(['nodes' => $nodes]);
        } catch (\Exception $e) {
            return $this->errorResponse("Internal Error: " . $e->getMessage(), 500);
        }
    }

    public function showNode(string $uuid, ShowStructureNodeAction $action): JsonResponse
    {
        $node = $action->execute($uuid);
        return $this->successResponse(['node' => $node]);
    }

    public function storeNode(StoreNodeRequest $request, CreateStructureNodeAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return response()->json([
                'success' => true,
                'message' => 'Node created successfully',
                'node'    => $result['node'],
                'link'    => $result['link'] ?? null,
            ], 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    public function updateNode(UpdateNodeRequest $request, string $uuid, UpdateStructureNodeAction $action): JsonResponse
    {
        try {
            $node = $action->execute($uuid, $request->validated());
            return $this->successResponse(['node' => $node], 'Node updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    public function destroyNode(string $uuid, DeleteStructureNodeAction $action): JsonResponse
    {
        try {
            $action->execute($uuid);
            return $this->successResponse([], 'Node deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    // ─── Links ──────────────────────────────────────────────────────────

    public function links(ListLinksRequest $request, ListStructureLinksAction $action): JsonResponse
    {
        $links = $action->execute($request->validated());
        return $this->successResponse(['links' => $links]);
    }

    public function storeLink(StoreLinkRequest $request, CreateStructureLinkAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $link = $action->execute(
                $validated['source_node_uuid'],
                $validated['target_node_uuid'],
                $validated
            );
            return response()->json([
                'success' => true,
                'message' => 'Link created successfully',
                'link'    => $link,
            ], 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    public function updateLink(UpdateLinkRequest $request, int $id, UpdateStructureLinkAction $action): JsonResponse
    {
        try {
            $link = $action->execute($id, $request->validated());
            return $this->successResponse(['link' => $link], 'Link updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroyLink(int $id, DeleteStructureLinkAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse([], 'Link deleted successfully');
    }

    // ─── Scope Context ──────────────────────────────────────────────────

    public function scopeContext(string $uuid, ResolveScopeContextAction $action): JsonResponse
    {
        $context = $action->execute($uuid);
        return $this->successResponse($context);
    }

    // ─── Statistics ─────────────────────────────────────────────────────

    public function statistics(GetOrgStatisticsAction $action): JsonResponse
    {
        try {
            $stats = $action->execute();
            return $this->successResponse(['statistics' => $stats]);
        } catch (\Exception $e) {
            return $this->errorResponse("Statistics Error: " . $e->getMessage(), 500);
        }
    }

    // ─── Integrity Check ────────────────────────────────────────────────

    public function integrityCheck(RunIntegrityCheckAction $action): JsonResponse
    {
        $issues = $action->execute();
        return $this->successResponse([
            'issues'   => $issues,
            'total'    => count($issues),
            'errors'   => count(array_filter($issues, fn($i) => $i['type'] === 'ERROR')),
            'warnings' => count(array_filter($issues, fn($i) => $i['type'] === 'WARNING')),
            'info'     => count(array_filter($issues, fn($i) => $i['type'] === 'INFO')),
        ]);
    }

    // ─── Change History ─────────────────────────────────────────────────

    public function changeHistory(GetChangeHistoryRequest $request, GetOrgChangeHistoryAction $action): JsonResponse
    {
        $validated = $request->validated();
        $history = $action->execute(
            $validated['entity_type'] ?? null,
            $validated['entity_id'] ?? null,
            (int) ($validated['limit'] ?? 50)
        );

        return $this->successResponse(['history' => $history]);
    }

    // ─── Bulk Operations ────────────────────────────────────────────────

    public function bulkStatusUpdate(BulkStatusUpdateRequest $request, BulkUpdateNodeStatusAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($validated['node_uuids'], $validated['status']);
        return $this->successResponse($result, "Updated {$result['updated']} nodes.");
    }
}
