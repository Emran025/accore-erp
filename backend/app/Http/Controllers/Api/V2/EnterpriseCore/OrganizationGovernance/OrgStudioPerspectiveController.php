<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetNodeClosuresAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetOrgPerspectiveAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\RestructureOrgLinkAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\UpdateNodeFacetsAction;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\GetNodeClosuresRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\GetOrgPerspectiveRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\RestructureOrgLinkRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\UpdateNodeFacetsRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\OrgPerspectiveResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\StructureLinkResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\StructureNodeResource;
use Illuminate\Http\JsonResponse;

/**
 * Organization Studio Perspective Engine:
 * Implements "One Organization, Five Perspectives" (Legal, Facilities, Workforce, Financial, Matrix),
 * dynamic facet toggles, temporal restructuring, and closure analytics.
 */
class OrgStudioPerspectiveController extends Controller
{
    use BaseApiController;

    /**
     * Retrieve the organization graph projected through a specific perspective lens.
     * Perspectives: 'legal', 'facilities', 'workforce', 'financial', 'matrix', 'all'
     */
    public function getPerspective(
        string $key,
        GetOrgPerspectiveRequest $request,
        GetOrgPerspectiveAction $action
    ): JsonResponse {
        $result = $action->execute($key, $request->validated());

        return $this->successResponse(
            new OrgPerspectiveResource($result),
            "Perspective [{$key}] retrieved successfully."
        );
    }

    /**
     * Temporal Link Restructuring:
     * Reassigns a node's reporting line with effective dating and cycle prevention.
     */
    public function restructure(
        RestructureOrgLinkRequest $request,
        RestructureOrgLinkAction $action
    ): JsonResponse {
        $link = $action->execute($request->validated());

        return $this->successResponse(
            new StructureLinkResource($link),
            "Organizational structure link updated effective " . ($request->input('effective_date') ?? now()->toDateString()) . "."
        );
    }

    /**
     * Update dynamic facets on a structure node and synchronize domain projections.
     */
    public function updateFacets(
        string $uuid,
        UpdateNodeFacetsRequest $request,
        UpdateNodeFacetsAction $action
    ): JsonResponse {
        $node = $action->execute($uuid, $request->validated());

        return $this->successResponse(
            new StructureNodeResource($node),
            'Node facets updated and synced successfully.'
        );
    }

    /**
     * Get transitive closure graph (ancestors and descendants) for a specific node.
     */
    public function getClosures(
        string $uuid,
        GetNodeClosuresRequest $request,
        GetNodeClosuresAction $action
    ): JsonResponse {
        $planeType = $request->input('plane_type', 'OPERATIONAL_HIERARCHY');
        $result = $action->execute($uuid, $planeType);

        return $this->successResponse(
            [
                'data' => [
                    'node_uuid'   => $result['node_uuid'],
                    'plane_type'  => $result['plane_type'],
                    'ancestors'   => StructureNodeResource::collection($result['ancestors']),
                    'descendants' => StructureNodeResource::collection($result['descendants']),
                ],
            ],
            'Transitive closures retrieved.'
        );
    }
}
