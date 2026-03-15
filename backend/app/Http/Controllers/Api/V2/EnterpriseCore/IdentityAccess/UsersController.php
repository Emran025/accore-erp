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
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\EnterpriseCore\IdentityAccess\UserResource;

class UsersController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $data = (new ListUsersAction())->execute();

        return $this->successResponse(UserResource::collection($data));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = (new CreateUserAction())->execute($request->validated());

        return $this->successResponse(new UserResource($user));
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        (new UpdateUserAction())->execute($request->validated());

        return $this->successResponse();
    }

    public function destroy(Request $request): JsonResponse
    {
        $id = $request->input('id');

        (new DeleteUserAction())->execute((int) $id);

        return $this->successResponse();
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $result = (new ChangePasswordAction())->execute($request->validated());

        if (!$result['success']) {
            return $this->errorResponse($result['error'], 400);
        }

        return $this->successResponse([], 'Password changed successfully');
    }

    public function managerList(): JsonResponse
    {
        $data = (new ListManagersAction())->execute();

        return $this->successResponse($data);
    }

    public function roles(): JsonResponse
    {
        $roles = (new ListUserRolesAction())->execute();

        return $this->successResponse($roles);
    }

    public function mySessions(): JsonResponse
    {
        $data = (new ListMySessionsAction())->execute();

        return $this->successResponse($data);
    }
}
