<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreateRoleAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\DeleteRoleAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListRolesAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\StoreRoleRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\UpdatePermissionsRequest;
use App\Http\Resources\EnterpriseCore\IdentityAccess\RoleResource;
use App\Http\Resources\EnterpriseCore\IdentityAccess\RolePermissionResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\ModuleResource;
use App\Http\Requests\EnterpriseCore\IdentityAccess\ListRolesRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class RolesController extends Controller
{
    use BaseApiController;

    public function index(ListRolesRequest $request, ListRolesAction $action): JsonResponse
    {
        $validated = $request->validated();
        $result = $action->execute($validated);

        if (isset($result['key']) && $result['key'] === 'error') {
            return $this->errorResponse($result['message'] ?? 'Error');
        }

        $key = $result['key'];
        $data = $result['data'];
        $actionType = $validated['action'] ?? null;

        if ($actionType === 'modules') {
            $formattedData = [];
            foreach ($data as $category => $modules) {
                $formattedData[$category] = ModuleResource::collection($modules);
            }
            return $this->successResponse(['data' => $formattedData]);
        }

        if ($actionType === 'role_permissions') {
            return $this->successResponse(['data' => RolePermissionResource::collection($data)]);
        }

        return $this->successResponse([$key => RoleResource::collection($data)]);
    }

    public function store(Request $request, CreateRoleAction $action): JsonResponse
    {
        $actionType = $request->query('action');

        if ($actionType === 'update_permissions') {
            $validated = $request->validate((new UpdatePermissionsRequest())->rules());
            $result = $action->execute('update_permissions', $validated);
            return $this->successResponse([], $result['message']);
        }

        // Default: Create role
        $validated = $request->validate((new StoreRoleRequest())->rules());
        $role = $action->execute('create', $validated);

        return $this->successResponse(new RoleResource($role), 'Role created successfully', 201);
    }

    public function destroy($id, DeleteRoleAction $action): JsonResponse
    {
        $result = $action->execute((int) $id);

        if (!$result['success']) {
            return $this->errorResponse($result['error'] ?? 'Delete failed', $result['status'] ?? 400);
        }

        return $this->successResponse([], 'Role deleted');
    }
}