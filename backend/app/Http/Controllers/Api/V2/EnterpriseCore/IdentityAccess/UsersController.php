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
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class UsersController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $data = (new ListUsersAction())->execute();
        $users = User::with(['roleRelation', 'manager', 'createdBy'])->orderBy('id', 'desc')->get();

        return $this->successResponse(UserResource::collection($users));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = (new CreateUserAction())->execute($request->validated());
        $user = User::find($data['id'] ?? $data);

        return $this->successResponse(new UserResource($user), 'User created successfully', 201);
    }

    public function update(UpdateUserRequest $request): JsonResponse
    {
        (new UpdateUserAction())->execute($request->validated());
        $user = User::find($request->input('id'));

        return $this->successResponse(new UserResource($user), 'User updated successfully');
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
        // Since ListManagersAction returns an array of mapped data, and we want UserResource:
        $managers = User::where('role', 'manager')->orWhereHas('roleRelation', function($q){ $q->where('role_key', 'manager'); })->get();

        return $this->successResponse(UserResource::collection($managers));
    }

    public function roles(): JsonResponse
    {
        $rolesData = (new ListUserRolesAction())->execute();
        // Assuming ListUserRolesAction returns the collection of Role models or arrays that map to RoleResource
        return $this->successResponse(RoleResource::collection($rolesData));
    }

    public function mySessions(): JsonResponse
    {
        $data = (new ListMySessionsAction())->execute();

        return $this->successResponse(SessionResource::collection($data));
    }
}
