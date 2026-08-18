<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Domains\EnterpriseCore\DesktopDistribution\Models\DesktopDevice;
use App\Domains\EnterpriseCore\DesktopDistribution\Services\DesktopDistributionService;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CheckSessionAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\LoginAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\LogoutAction;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\IdentityAccess\Services\AuthService;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\IdentityAccess\LoginRequest;
use App\Http\Resources\EnterpriseCore\IdentityAccess\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use BaseApiController;

    public function login(LoginRequest $request, DesktopDistributionService $desktopDistribution): JsonResponse
    {
        $desktopDevice = $this->authenticatedDesktopDevice($request, $desktopDistribution);
        if ($desktopDevice === false) {
            return $this->errorResponse('Desktop device is not authorized.', 401, 'desktop.error.device_not_authorized');
        }

        $result = app(LoginAction::class)->execute($request->validated(), $desktopDevice);
        if (! $result['success']) {
            return $this->errorResponse($result['message'], 401);
        }

        $user = User::with('roleRelation')->find($result['user']['id']);

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $result['token'],
            'permissions' => $result['permissions'],
            'access_expires_at' => $result['access_expires_at'],
            'refresh_token' => $result['refresh_token'],
            'refresh_expires_at' => $result['refresh_expires_at'],
        ], 'Login successful');
    }

    public function refresh(Request $request, DesktopDistributionService $desktopDistribution, AuthService $authService): JsonResponse
    {
        $validated = $request->validate(['refresh_token' => ['required', 'string', 'min:64', 'max:255']]);
        $desktopDevice = $this->authenticatedDesktopDevice($request, $desktopDistribution);
        if ($desktopDevice === false) {
            return $this->errorResponse('Desktop device is not authorized.', 401, 'desktop.error.device_not_authorized');
        }
        if ($desktopDevice === null) {
            return $this->errorResponse('A registered desktop device is required.', 401, 'desktop.error.device_required');
        }

        $result = $authService->refreshDesktopSession($desktopDevice, $validated['refresh_token']);
        if (! $result['success']) {
            return $this->errorResponse('The desktop refresh credential is invalid or expired.', 401, 'desktop.error.refresh_invalid');
        }

        return $this->successResponse([
            'token' => $result['session_token'],
            'access_expires_at' => $result['access_expires_at'],
            'refresh_token' => $result['refresh_token'],
            'refresh_expires_at' => $result['refresh_expires_at'],
        ], 'Desktop session refreshed');
    }

    public function revoke(Request $request, DesktopDistributionService $desktopDistribution, AuthService $authService): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => ['required', 'string', 'min:64', 'max:255'],
            'reason' => ['nullable', 'string', 'max:120'],
        ]);
        $desktopDevice = $this->authenticatedDesktopDevice($request, $desktopDistribution);
        if (! $desktopDevice instanceof DesktopDevice) {
            return $this->errorResponse('Desktop device is not authorized.', 401, 'desktop.error.device_not_authorized');
        }

        $revoked = $authService->revokeDesktopSession(
            $desktopDevice,
            $validated['refresh_token'],
            $validated['reason'] ?? 'client_credential_removed',
        );

        return $this->successResponse(['revoked' => $revoked], 'Desktop session revoked');
    }

    public function logout(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Session-Token') ?? session('session_token');
        app(LogoutAction::class)->execute($sessionToken);

        return $this->successResponse([], 'Logged out successfully');
    }

    public function check(Request $request): JsonResponse
    {
        $result = app(CheckSessionAction::class)->execute($request->header('X-Session-Token'));
        if (! $result['success']) {
            return $this->errorResponse($result['message'], 401);
        }

        $user = User::with('roleRelation')->find($result['user']['id']);

        return $this->successResponse([
            'user' => new UserResource($user),
            'permissions' => $result['permissions'],
            'authenticated' => true,
        ]);
    }

    private function authenticatedDesktopDevice(Request $request, DesktopDistributionService $desktopDistribution): DesktopDevice|false|null
    {
        $deviceId = $request->header('X-Accore-Device-Id');
        $deviceToken = $request->header('X-Accore-Device-Token');
        if ($deviceId === null && $deviceToken === null) {
            return null;
        }
        if (! is_string($deviceId) || ! is_string($deviceToken) || $deviceId === '' || $deviceToken === '') {
            return false;
        }

        $result = $desktopDistribution->authenticateDevice($deviceId, $deviceToken, $request->ip());

        return $result['status'] === 'authorized' ? $result['device'] : false;
    }
}
