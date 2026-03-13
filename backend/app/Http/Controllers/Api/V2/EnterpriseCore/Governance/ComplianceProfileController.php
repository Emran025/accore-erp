<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\Governance;

use App\Http\Controllers\Controller;
use App\Domains\DigitalPlatform\Compliance\Actions\CreateComplianceProfileAction;
use App\Domains\DigitalPlatform\Compliance\Actions\DeleteComplianceProfileAction;
use App\Domains\DigitalPlatform\Compliance\Actions\GenerateComplianceProfileTokenAction;
use App\Domains\DigitalPlatform\Compliance\Actions\GetComplianceSystemKeysAction;
use App\Domains\DigitalPlatform\Compliance\Actions\ListComplianceProfilesAction;
use App\Domains\DigitalPlatform\Compliance\Actions\RevokeComplianceProfileTokenAction;
use App\Domains\DigitalPlatform\Compliance\Actions\ServeCompliancePullDataAction;
use App\Domains\DigitalPlatform\Compliance\Actions\ShowComplianceProfileAction;
use App\Domains\DigitalPlatform\Compliance\Actions\UpdateComplianceProfileAction;
use App\Domains\DigitalPlatform\Compliance\Actions\ValidateComplianceStructureAction;
use App\Http\Requests\EnterpriseCore\Governance\GenerateComplianceTokenRequest;
use App\Http\Requests\EnterpriseCore\Governance\StoreComplianceProfileRequest;
use App\Http\Requests\EnterpriseCore\Governance\UpdateComplianceProfileRequest;
use App\Http\Requests\EnterpriseCore\Governance\ValidateComplianceStructureRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class ComplianceProfileController extends Controller
{
    use BaseApiController;

    /**
     * List all compliance profiles (optionally filtered by authority/policy).
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['tax_authority_id', 'policy_type', 'active_only']);

        $data = (new ListComplianceProfilesAction())->execute($filters);

        return $this->successResponse($data);
    }

    /**
     * Show a single compliance profile.
     */
    public function show($id): JsonResponse
    {
        $data = (new ShowComplianceProfileAction())->execute((int) $id);

        return $this->successResponse($data);
    }

    /**
     * Create a new compliance profile.
     */
    public function store(StoreComplianceProfileRequest $request): JsonResponse
    {
        $data = (new CreateComplianceProfileAction())->execute($request->validated());

        return $this->successResponse($data, 'Compliance profile created successfully.');
    }

    /**
     * Update an existing compliance profile.
     * Note: `code` is immutable after creation.
     */
    public function update(UpdateComplianceProfileRequest $request, $id): JsonResponse
    {
        $data = (new UpdateComplianceProfileAction())->execute((int) $id, $request->validated());

        return $this->successResponse($data, 'Compliance profile updated successfully.');
    }

    /**
     * Delete a compliance profile.
     */
    public function destroy($id): JsonResponse
    {
        (new DeleteComplianceProfileAction())->execute((int) $id);

        return $this->successResponse([], 'Compliance profile deleted successfully.');
    }

    /**
     * Generate (or regenerate) the access token for a pull-type profile.
     * Returns the raw token — this is the ONLY time it's visible in full.
     */
    public function generateToken(GenerateComplianceTokenRequest $request, $id): JsonResponse
    {
        $result = (new GenerateComplianceProfileTokenAction())->execute((int) $id, $request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 422);
        }

        return $this->successResponse($result['data'], 'Access token generated successfully.');
    }

    /**
     * Revoke the access token for a pull-type profile.
     */
    public function revokeToken($id): JsonResponse
    {
        $result = (new RevokeComplianceProfileTokenAction())->execute((int) $id);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 422);
        }

        return $this->successResponse([], 'Access token revoked successfully.');
    }

    /**
     * Get the available system keys that can be mapped.
     * Returns all keys from the tax engine that the user can use in their mapping.
     */
    public function getSystemKeys(): JsonResponse
    {
        $data = (new GetComplianceSystemKeysAction())->execute();

        return $this->successResponse($data);
    }

    /**
     * Validate a structure template against its format.
     */
    public function validateStructure(ValidateComplianceStructureRequest $request): JsonResponse
    {
        $data = (new ValidateComplianceStructureAction())->execute($request->validated());

        return $this->successResponse($data);
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
    public function servePullData(Request $request, string $code, string $path = 'compliance-data'): JsonResponse
    {
        $result = (new ServeCompliancePullDataAction())->execute(
            $code,
            $request->bearerToken(),
            $request->ip()
        );

        if (!$result['success']) {
            return response()->json([
                'error' => $result['error'],
                'code'  => $result['error_code'],
            ], $result['status']);
        }

        $response = response()->json($result['data']);

        foreach ($result['headers'] as $header => $value) {
            $response->header($header, $value);
        }

        return $response;
    }
}