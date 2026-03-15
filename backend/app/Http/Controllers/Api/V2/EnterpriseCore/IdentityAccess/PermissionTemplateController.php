<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\IdentityAccess;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ListPermissionTemplatesAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\CreatePermissionTemplateAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\UpdatePermissionTemplateAction;
use App\Domains\EnterpriseCore\IdentityAccess\Actions\ApplyPermissionTemplateAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class PermissionTemplateController extends Controller
{
    use BaseApiController;

    /**
     * List all permission templates.
     */
    public function index(ListPermissionTemplatesAction $action): JsonResponse
    {
        $templates = $action->execute();
        return $this->successResponse($templates);
    }

    /**
     * Store a new permission template.
     */
    public function store(Request $request, CreatePermissionTemplateAction $action): JsonResponse
    {
        $template = $action->execute($request->all());
        return $this->successResponse($template, 'Permission template created successfully');
    }

    /**
     * Update an existing permission template.
     */
    public function update(Request $request, int $id, UpdatePermissionTemplateAction $action): JsonResponse
    {
        $template = $action->execute($id, $request->all());
        return $this->successResponse($template, 'Permission template updated successfully');
    }

    /**
     * Apply a permission template to one or more users.
     */
    public function apply(Request $request, ApplyPermissionTemplateAction $action): JsonResponse
    {
        $action->execute($request->all());
        return $this->successResponse([], 'Permission template applied successfully');
    }
}
