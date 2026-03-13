<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IAM;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IAM\Actions\ChangePasswordAction;
use App\Domains\EnterpriseCore\IAM\Actions\CreateUserAction;
use App\Domains\EnterpriseCore\IAM\Actions\DeleteUserAction;
use App\Domains\EnterpriseCore\IAM\Actions\ListManagersAction;
use App\Domains\EnterpriseCore\IAM\Actions\ListMySessionsAction;
use App\Domains\EnterpriseCore\IAM\Actions\ListUserRolesAction;
use App\Domains\EnterpriseCore\IAM\Actions\ListUsersAction;
use App\Domains\EnterpriseCore\IAM\Actions\UpdateUserAction;
use App\Http\Requests\EnterpriseCore\IAM\ChangePasswordRequest;
use App\Http\Requests\EnterpriseCore\IAM\StoreUserRequest;
use App\Http\Requests\EnterpriseCore\IAM\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class UsersController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $data = (new ListUsersAction())->execute();

        return $this->successResponse($data);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = (new CreateUserAction())->execute($request->validated());

        return $this->successResponse($data);
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

        return response()->json(['success' => true, 'roles' => $roles]);
    }

    public function mySessions(): JsonResponse
    {
        $data = (new ListMySessionsAction())->execute();

        return $this->successResponse($data);
    }
}
