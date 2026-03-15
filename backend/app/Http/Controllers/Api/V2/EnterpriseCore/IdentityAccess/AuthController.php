<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\LoginAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\LogoutAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CheckSessionAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\LoginRequest;
use App\Http\Resources\EnterpriseCore\IdentityAccess\UserResource;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AuthController extends Controller
{
    use BaseApiController;

    public function login(LoginRequest $request): JsonResponse
    {
        $action = app(LoginAction::class);
        $result = $action->execute($request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 401);
        }

        // We wrap the user in our standardized resource for consistency
        $user = User::with('roleRelation')->find($result['user']['id']);
        
        return $this->successResponse([
            'user'        => new UserResource($user),
            'token'       => $result['token'],
            'permissions' => $result['permissions'],
        ], 'Login successful');
    }

    public function logout(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Session-Token') ?? session('session_token');

        $action = app(LogoutAction::class);
        $action->execute($sessionToken);

        return $this->successResponse([], 'Logged out successfully');
    }

    public function check(Request $request): JsonResponse
    {
        $action = app(CheckSessionAction::class);
        $result = $action->execute($request->header('X-Session-Token'));

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 401);
        }

        $user = User::with('roleRelation')->find($result['user']['id']);

        return $this->successResponse([
            'user'          => new UserResource($user),
            'permissions'   => $result['permissions'],
            'authenticated' => true,
        ]);
    }
}