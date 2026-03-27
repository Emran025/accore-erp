<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListPermissionTemplatesAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ApplyPermissionTemplateAction;
use App\Http\Requests\EnterpriseCore\IdentityAccess\StorePermissionTemplateRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\UpdatePermissionTemplateRequest;
use App\Http\Requests\EnterpriseCore\IdentityAccess\ApplyPermissionTemplateRequest;
use App\Http\Resources\EnterpriseCore\IdentityAccess\PermissionTemplateResource;
use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreatePermissionTemplateAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\UpdatePermissionTemplateAction;

class PermissionTemplateController extends Controller
{
    use BaseApiController;

    /**
     * List all permission templates.
     */
    public function index(ListPermissionTemplatesAction $action): JsonResponse
    {
        $templates = $action->execute();
        return $this->successResponse(PermissionTemplateResource::collection($templates));
    }

    /**
     * Store a new permission template.
     */
    public function store(StorePermissionTemplateRequest $request, CreatePermissionTemplateAction $action): JsonResponse
    {
        $template = $action->execute($request->validated());
        return $this->successResponse(new PermissionTemplateResource($template), 'Permission template created successfully', 201);
    }

    /**
     * Update an existing permission template.
     */
    public function update(UpdatePermissionTemplateRequest $request, int $id, UpdatePermissionTemplateAction $action): JsonResponse
    {
        $template = $action->execute($id, $request->validated());
        return $this->successResponse(new PermissionTemplateResource($template), 'Permission template updated successfully');
    }

    /**
     * Apply a permission template to one or more users.
     */
    public function apply(ApplyPermissionTemplateRequest $request, ApplyPermissionTemplateAction $action): JsonResponse
    {
        $action->execute($request->validated());
        return $this->successResponse([], 'Permission template applied successfully');
    }
}
