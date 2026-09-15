<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetLatestBlueprintAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\PublishBlueprintAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\StageBlueprintAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ValidateBlueprintAction;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\PublishBlueprintRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\StageBlueprintRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ValidateBlueprintRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\OrgBlueprintResource;
use Illuminate\Http\JsonResponse;

/**
 * Manages the full lifecycle of organization blueprints:
 * staging drafts, validation, previewing, and atomic ACID compilation into the live database.
 */
class BlueprintLifecycleController extends Controller
{
    use BaseApiController;

    /**
     * Get the latest staged or draft blueprint.
     */
    public function latest(GetLatestBlueprintAction $action): JsonResponse
    {
        $blueprint = $action->execute();

        if (!$blueprint) {
            return $this->successResponse([
                'data' => null,
            ], 'No organization blueprint found.');
        }

        return $this->successResponse(
            new OrgBlueprintResource($blueprint)
        );
    }

    /**
     * Stage or update a draft blueprint.
     */
    public function stage(StageBlueprintRequest $request, StageBlueprintAction $action): JsonResponse
    {
        $blueprint = $action->execute($request->validated());

        return $this->successResponse(
            new OrgBlueprintResource($blueprint),
            'Blueprint staged successfully.'
        );
    }

    /**
     * Validate an organization blueprint contract before compilation.
     */
    public function validateBlueprint(ValidateBlueprintRequest $request, ValidateBlueprintAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse(
            $result,
            $result['valid'] ? 'Blueprint passed validation.' : 'Blueprint has validation errors.'
        );
    }

    /**
     * Publish and atomically compile the staged blueprint into the live database.
     */
    public function publish(string $uuid, PublishBlueprintRequest $request, PublishBlueprintAction $action): JsonResponse
    {
        try {
            $result = $action->execute($uuid, $request->validated());

            return $this->successResponse(
                $result,
                'Organization blueprint published and compiled successfully.'
            );
        } catch (\Throwable $e) {
            return $this->errorResponse(
                'Failed to compile blueprint: ' . $e->getMessage(),
                500
            );
        }
    }
}
