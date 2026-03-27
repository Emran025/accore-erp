<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\CreateComplianceProfileAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\DeleteComplianceProfileAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\GenerateComplianceProfileTokenAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\GetComplianceSystemKeysAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\ListComplianceProfilesAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\RevokeComplianceProfileTokenAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\ServeCompliancePullDataAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\ShowComplianceProfileAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\UpdateComplianceProfileAction;
use App\Domains\EnterpriseCore\MonitoringCompliance\Actions\ValidateComplianceStructureAction;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\GenerateComplianceTokenRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListComplianceProfilesRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\StoreComplianceProfileRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\UpdateComplianceProfileRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ValidateComplianceStructureRequest;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\EnterpriseCore\MonitoringCompliance\ComplianceProfileResource;
use App\Http\Resources\EnterpriseCore\MonitoringCompliance\ComplianceTokenResource;
use App\Http\Resources\EnterpriseCore\MonitoringCompliance\ComplianceValidationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceProfileController extends Controller
{
    use BaseApiController;

    /**
     * List all compliance profiles (optionally filtered by authority/policy).
     */
    public function index(ListComplianceProfilesRequest $request, ListComplianceProfilesAction $action): JsonResponse
    {
        $profiles = $action->execute($request->validated());
        return $this->successResponse(ComplianceProfileResource::collection($profiles));
    }

    /**
     * Show a single compliance profile.
     */
    public function show(int $id, ShowComplianceProfileAction $action): JsonResponse
    {
        $profile = $action->execute($id);
        return $this->successResponse(new ComplianceProfileResource($profile));
    }

    /**
     * Create a new compliance profile.
     */
    public function store(StoreComplianceProfileRequest $request, CreateComplianceProfileAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $profile = $result['profile'] ?? $result;
        
        $response = $this->successResponse(new ComplianceProfileResource($profile), 'Compliance profile created successfully.', 201);
        
        if (isset($result['access_token'])) {
            $data = $response->getData(true);
            $data['access_token'] = $result['access_token'];
            $response->setData($data);
        }

        return $response;
    }

    /**
     * Update an existing compliance profile.
     * Note: `code` is immutable after creation.
     */
    public function update(UpdateComplianceProfileRequest $request, int $id, UpdateComplianceProfileAction $action): JsonResponse
    {
        $profile = $action->execute($id, $request->validated());
        return $this->successResponse(new ComplianceProfileResource($profile), 'Compliance profile updated successfully.');
    }

    /**
     * Delete a compliance profile.
     */
    public function destroy(int $id, DeleteComplianceProfileAction $action): JsonResponse
    {
        $action->execute($id);

        return $this->successResponse([], 'Compliance profile deleted successfully.');
    }

    /**
     * Generate (or regenerate) the access token for a pull-type profile.
     * Returns the raw token — this is the ONLY time it's visible in full.
     */
    public function generateToken(GenerateComplianceTokenRequest $request, int $id, GenerateComplianceProfileTokenAction $action): JsonResponse
    {
        $result = $action->execute($id, $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 422);
        }

        return $this->successResponse(new ComplianceTokenResource($result['data']), 'Access token generated successfully.');
    }

    /**
     * Revoke the access token for a pull-type profile.
     */
    public function revokeToken(int $id, RevokeComplianceProfileTokenAction $action): JsonResponse
    {
        $result = $action->execute($id);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 422);
        }

        return $this->successResponse([], 'Access token revoked successfully.');
    }

    /**
     * Get the available system keys that can be mapped.
     * Returns all keys from the tax engine that the user can use in their mapping.
     */
    public function getSystemKeys(GetComplianceSystemKeysAction $action): JsonResponse
    {
        $data = $action->execute();

        return $this->successResponse($data);
    }

    /**
     * Validate a structure template against its format.
     */
    public function validateStructure(ValidateComplianceStructureRequest $request, ValidateComplianceStructureAction $action): JsonResponse
    {
        $data = $action->execute($request->validated());

        return $this->successResponse(new ComplianceValidationResource($data));
    }

    // ══════════════════════════════════════════
    // Pull Endpoint (External Access)
    // ══════════════════════════════════════════

    /**
     * Serve compliance data to an external entity via a pull endpoint.
     * This is called by the entity's system using their access token.
     *
     * Route: GET /api/compliance-pull/{code}/{path?}
     * Auth: Bearer token in Authorization header
     */
    public function servePullData(Request $request, string $code, string $path = 'compliance-data', ServeCompliancePullDataAction $action): JsonResponse
    {
        $result = $action->execute(
            $code,
            $request->bearerToken(),
            $request->ip()
        );

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'error'   => $result['error'],
                'code'    => $result['error_code'],
            ], $result['status']);
        }

        $response = response()->json([
            'success' => true,
            'data'    => $result['data']
        ]);

        foreach ($result['headers'] as $header => $value) {
            $response->header($header, $value);
        }

        return $response;
    }
}