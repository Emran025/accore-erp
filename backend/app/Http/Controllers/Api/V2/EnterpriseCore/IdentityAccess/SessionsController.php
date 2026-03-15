<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListSessionsAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\DestroySessionAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class SessionsController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();
        if (!$userId) {
            return $this->errorResponse('Unauthorized', 401);
        }

        $limit = (int) $request->query('limit', 10);
        $currentToken = $request->header('X-Session-Token');

        $data = (new ListSessionsAction())->execute($userId, $currentToken, $limit);

        return response()->json(array_merge(['success' => true], $data));
    }

    public function destroy($id): JsonResponse
    {
        $userId = auth()->id();
        $currentToken = request()->header('X-Session-Token');

        $result = (new DestroySessionAction())->execute((int) $id, $userId, $currentToken);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse([], 'Session terminated');
    }
}