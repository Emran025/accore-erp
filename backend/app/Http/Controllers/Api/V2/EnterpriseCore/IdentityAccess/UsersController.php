<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ChangePasswordAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreateUserAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\DeleteUserAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListManagersAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListMySessionsAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListUserRolesAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListUsersAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\UpdateUserAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\ChangePasswordRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\StoreUserRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\UpdateUserRequest;
use App\Http\Resources\EnterpriseCore\IdentityAccess\UserResource;
use App\Http\Resources\EnterpriseCore\IdentityAccess\RoleResource;
use App\Http\Resources\EnterpriseCore\IdentityAccess\SessionResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class UsersController extends Controller
{
    use BaseApiController;

    public function index(ListUsersAction $action): JsonResponse
    {
        $users = $action->execute();
        return $this->successResponse(UserResource::collection($users));
    }

    public function store(StoreUserRequest $request, CreateUserAction $action): JsonResponse
    {
        $user = $action->execute($request->validated());
        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    public function update(UpdateUserRequest $request, int|string $id, UpdateUserAction $action): JsonResponse
    {
        $user = $action->execute($id, $request->validated());
        return $this->successResponse(new UserResource($user), 'User updated successfully');
    }

    public function destroy(int|string $id, DeleteUserAction $action): JsonResponse
    {
        $action->execute((int) $id);
        return $this->successResponse(null, 'User deleted successfully');
    }

    public function changePassword(ChangePasswordRequest $request, ChangePasswordAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse([], 'Password changed successfully');
    }

    public function managerList(ListManagersAction $action): JsonResponse
    {
        $managers = $action->execute();
        return $this->successResponse(UserResource::collection($managers));
    }

    public function roles(ListUserRolesAction $action): JsonResponse
    {
        $roles = $action->execute();
        return $this->successResponse(RoleResource::collection($roles));
    }

    public function mySessions(ListMySessionsAction $action): JsonResponse
    {
        $sessions = $action->execute();
        return $this->successResponse(SessionResource::collection($sessions));
    }
}
