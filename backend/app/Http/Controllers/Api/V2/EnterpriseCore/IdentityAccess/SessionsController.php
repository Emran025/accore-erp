<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListSessionsAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\DestroySessionAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\ListSessionsRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\EnterpriseCore\IdentityAccess\SessionResource;

class SessionsController extends Controller
{
    use BaseApiController;

    public function index(ListSessionsRequest $request, ListSessionsAction $action): JsonResponse
    {
        $userId = auth()->id() ?? session('user_id');
        if (!$userId) {
            return $this->errorResponse('Unauthorized', 401);
        }

        $limit = (int) ($request->validated()['limit'] ?? 10);
        $sessions = $action->execute($userId, $limit);

        return $this->successResponse(SessionResource::collection($sessions));
    }

    public function destroy(int|string $id, DestroySessionAction $action): JsonResponse
    {
        $userId = auth()->id() ?? session('user_id');
        $currentToken = request()->header('X-Session-Token');

        $result = $action->execute((int) $id, $userId, $currentToken);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse([], 'Session terminated');
    }
}