<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreateRoleAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\DeleteRoleAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListRolesAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\StoreRoleRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\UpdatePermissionsRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class RolesController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListRolesAction $action): JsonResponse
    {
        $filters = $request->only(['action', 'role_id']);

        $result = $action->execute($filters);

        if (error_get_last() || (isset($result['key']) && $result['key'] === 'error')) {
            return $this->errorResponse($result['message'] ?? 'Error');
        }

        return response()->json(['success' => true, $result['key'] => $result['data']]);
    }

    public function store(Request $request, CreateRoleAction $action): JsonResponse
    {
        $actionType = $request->query('action');

        if ($actionType === 'update_permissions') {
            $validated = app(UpdatePermissionsRequest::class)->validated();
            $result = $action->execute('update_permissions', $validated);
            return $this->successResponse([], $result['message']);
        }

        // Default: Create role
        $validated = app(StoreRoleRequest::class)->validated();
        $result = $action->execute('create', $validated);

        return $this->successResponse(['id' => $result['id']], $result['message']);
    }

    public function destroy($id, DeleteRoleAction $action): JsonResponse
    {
        $result = $action->execute((int) $id);

        if (!$result['success']) {
            return $this->errorResponse($result['error'], $result['status']);
        }

        return $this->successResponse([], 'Role deleted');
    }
}