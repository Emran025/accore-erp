<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\BulkStatusUpdateRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\StoreLinkRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\StoreNodeRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\UpdateLinkRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\UpdateNodeRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListMetaTypesRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListNodesRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListLinksRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\GetChangeHistoryRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListMetaTypesAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListTopologyRulesAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListStructureNodesAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ShowStructureNodeAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\CreateStructureNodeAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateStructureNodeAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\DeleteStructureNodeAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListStructureLinksAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\CreateStructureLinkAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateStructureLinkAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\DeleteStructureLinkAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ResolveScopeContextAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetOrgStatisticsAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\RunIntegrityCheckAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetOrgChangeHistoryAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\BulkUpdateNodeStatusAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureNode;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\StructureLink;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\StructureNodeResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\StructureLinkResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\OrgMetaTypeResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\TopologyRuleResource;

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
        return $this->successResponse(OrgMetaTypeResource::collection($types));
    }

    // ─── Topology Rules ─────────────────────────────────────────────────

    public function topologyRules(ListTopologyRulesAction $action): JsonResponse
    {
        $rules = $action->execute();
        return $this->successResponse(TopologyRuleResource::collection($rules));
    }

    // ─── Nodes ──────────────────────────────────────────────────────────

    public function nodes(ListNodesRequest $request, ListStructureNodesAction $action): JsonResponse
    {
        try {
            $nodes = $action->execute($request->validated());
            return $this->successResponse(StructureNodeResource::collection($nodes));
        } catch (\Exception $e) {
            return $this->errorResponse("Internal Error: " . $e->getMessage(), 500);
        }
    }

    public function showNode(string $uuid, ShowStructureNodeAction $action): JsonResponse
    {
        $nodeData = $action->execute($uuid);
        $node = StructureNode::where('uuid', $uuid)->first();
        return $this->successResponse(new StructureNodeResource($node));
    }

    public function storeNode(StoreNodeRequest $request, CreateStructureNodeAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $node = StructureNode::find($result['node']['id'] ?? $result['node']);
            return $this->successResponse(new StructureNodeResource($node), 'Node created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    public function updateNode(UpdateNodeRequest $request, string $uuid, UpdateStructureNodeAction $action): JsonResponse
    {
        try {
            $nodeData = $action->execute($uuid, $request->validated());
            $node = StructureNode::where('uuid', $uuid)->first();
            return $this->successResponse(new StructureNodeResource($node), 'Node updated successfully');
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
        return $this->successResponse(StructureLinkResource::collection($links));
    }

    public function storeLink(StoreLinkRequest $request, CreateStructureLinkAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $linkResult = $action->execute(
                $validated['source_node_uuid'],
                $validated['target_node_uuid'],
                $validated
            );
            $link = StructureLink::find($linkResult['id'] ?? $linkResult);
            return $this->successResponse(new StructureLinkResource($link), 'Link created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }
    }

    public function updateLink(UpdateLinkRequest $request, int $id, UpdateStructureLinkAction $action): JsonResponse
    {
        try {
            $linkResult = $action->execute($id, $request->validated());
            $link = StructureLink::find($id);
            return $this->successResponse(new StructureLinkResource($link), 'Link updated successfully');
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
