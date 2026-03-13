<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IAM;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IAM\Actions\LoginAction;
use App\Domains\EnterpriseCore\IAM\Actions\LogoutAction;
use App\Domains\EnterpriseCore\IAM\Actions\CheckSessionAction;
use App\Http\Requests\EnterpriseCore\IAM\LoginRequest;
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
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 401);
        }

        return response()->json($result);
    }

    public function logout(Request $request): JsonResponse
    {
        $sessionToken = $request->header('X-Session-Token') ?? session('session_token');

        $action = app(LogoutAction::class);
        $action->execute($sessionToken);

        return response()->json(['success' => true]);
    }

    public function check(Request $request): JsonResponse
    {
        $action = app(CheckSessionAction::class);
        $result = $action->execute($request->header('X-Session-Token'));

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], 401);
        }

        return response()->json($result);
    }
}