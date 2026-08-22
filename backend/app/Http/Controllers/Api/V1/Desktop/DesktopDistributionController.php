<?php

namespace App\Http\Controllers\Api\V1\Desktop;

use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Desktop\EnrollDesktopDeviceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DesktopDistributionController extends Controller
{
    use BaseApiController;

    public function __construct(private readonly DesktopDistributionService $desktopDistribution) {}

    public function bootstrap(Request $request): JsonResponse
    {
        $clientVersion = $request->header('X-Accore-Client-Version');

        if (! $this->isValidVersion($clientVersion)) {
            return $this->errorResponse(
                'A valid X-Accore-Client-Version header is required.',
                422,
                'desktop.error.invalid_client_version',
            );
        }

        return $this->successResponse([
            'desktop' => $this->desktopDistribution->bootstrap($clientVersion, $request->ip()),
        ]);
    }

    public function enroll(EnrollDesktopDeviceRequest $request): JsonResponse
    {
        $result = $this->desktopDistribution->enroll($request->validated(), $request->ip());

        return match ($result['status']) {
            'enrolled' => $this->successResponse([
                'device' => [
                    'id' => $result['device']->device_id,
                    'status' => 'active',
                    'is_primary' => (bool) $result['device']->is_primary,
                    'enrolled_at' => $result['device']->enrolled_at?->toIso8601String(),
                ],
                // This token is returned exactly once. Only its slow hash is stored.
                'device_access_token' => $result['access_token'],
            ], 'Desktop device enrolled.', 201),
            'update_required' => $this->errorResponse(
                'This client must be updated before it can enroll.',
                426,
                'desktop.error.update_required',
            ),
            'server_mismatch' => $this->errorResponse(
                'The requested server identity does not match this Accore Server.',
                409,
                'desktop.error.server_mismatch',
            ),
            'certificate_mismatch' => $this->errorResponse(
                'The presented server certificate binding does not match this Accore Server.',
                409,
                'desktop.error.certificate_mismatch',
            ),
            'device_revoked' => $this->errorResponse(
                'This device has been revoked and cannot enroll.',
                403,
                'desktop.error.device_revoked',
            ),
            'device_already_enrolled' => $this->errorResponse(
                'This device is already enrolled.',
                409,
                'desktop.error.device_already_enrolled',
            ),
            default => $this->errorResponse(
                'The enrollment evidence is invalid, expired, revoked, or already used.',
                403,
                'desktop.error.enrollment_evidence_rejected',
            ),
        };
    }

    public function policy(Request $request): JsonResponse
    {
        $deviceId = (string) $request->header('X-Accore-Device-Id');
        $accessToken = (string) $request->header('X-Accore-Device-Token');
        $clientVersion = $request->header('X-Accore-Client-Version');

        if ($deviceId === '' || $accessToken === '') {
            return $this->errorResponse(
                'Device credentials are required.',
                401,
                'desktop.error.device_credentials_required',
            );
        }

        if (! $this->isValidVersion($clientVersion)) {
            return $this->errorResponse(
                'A valid X-Accore-Client-Version header is required.',
                422,
                'desktop.error.invalid_client_version',
            );
        }

        $authentication = $this->desktopDistribution->authenticateDevice($deviceId, $accessToken, $request->ip());

        if ($authentication['status'] === 'authorized') {
            $policy = $this->desktopDistribution->policyFor($authentication['device'], $clientVersion, $request->ip());

            if ($policy['compatibility']['status'] === 'update_required') {
                return response()->json([
                    'success' => false,
                    'message' => 'This client must be updated before it can continue.',
                    'message_key' => 'desktop.error.update_required',
                    'desktop' => [
                        'api_contract' => $policy['api_contract'],
                        'compatibility' => $policy['compatibility'],
                    ],
                ], 426);
            }

            return $this->successResponse(['desktop' => $policy]);
        }

        return match ($authentication['status']) {
            'device_revoked' => $this->errorResponse(
                'This device has been revoked.',
                403,
                'desktop.error.device_revoked',
            ),
            default => $this->errorResponse(
                'The device credentials are not authorized.',
                401,
                'desktop.error.device_not_authorized',
            ),
        };
    }

    private function isValidVersion(?string $version): bool
    {
        return is_string($version)
            && preg_match('/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/', $version) === 1;
    }
}
