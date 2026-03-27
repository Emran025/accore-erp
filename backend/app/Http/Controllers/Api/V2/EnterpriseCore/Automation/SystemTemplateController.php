<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\Automation;

use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\Automation\ListSystemTemplatesRequest;
use App\Http\Requests\EnterpriseCore\Automation\StoreSystemTemplateRequest;
use App\Http\Requests\EnterpriseCore\Automation\UpdateSystemTemplateRequest;
use App\Http\Requests\EnterpriseCore\Automation\RenderSystemTemplateRequest;
use App\Http\Requests\EnterpriseCore\Automation\GetSystemTemplateKeysRequest;
use App\Domains\EnterpriseCore\Automation\Actions\ListSystemTemplatesAction;
use App\Domains\EnterpriseCore\Automation\Actions\CreateSystemTemplateAction;
use App\Domains\EnterpriseCore\Automation\Actions\ShowSystemTemplateAction;
use App\Domains\EnterpriseCore\Automation\Actions\UpdateSystemTemplateAction;
use App\Domains\EnterpriseCore\Automation\Actions\DeleteSystemTemplateAction;
use App\Domains\EnterpriseCore\Automation\Actions\SystemTemplateOperationsAction;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\DocumentTemplateResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\DocumentTemplateHistoryResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

/**
 * System Template Controller
 * 
 * This controller enforces the exclusive use of system templates.
 * All template operations must go through the centralized Action classes
 * which ensures compliance with the Report and Document Management Policy.
 */
class SystemTemplateController extends Controller
{
    use BaseApiController;

    public function index(ListSystemTemplatesRequest $request, ListSystemTemplatesAction $action): JsonResponse
    {
        $templates = $action->execute($request->validated());
        return $this->successResponse(DocumentTemplateResource::collection($templates));
    }

    public function store(StoreSystemTemplateRequest $request, CreateSystemTemplateAction $action): JsonResponse
    {
        $template = $action->execute($request->validated());
        return $this->successResponse(new DocumentTemplateResource($template), 'Template created successfully', 201);
    }

    public function showByKey(string $key, ShowSystemTemplateAction $action): JsonResponse
    {
        $template = $action->executeByKey($key);
        return $this->successResponse(new DocumentTemplateResource($template));
    }

    public function showByType(string $type, ShowSystemTemplateAction $action): JsonResponse
    {
        $template = $action->executeByType($type);
        return $this->successResponse(new DocumentTemplateResource($template));
    }

    public function show($id, ShowSystemTemplateAction $action): JsonResponse
    {
        $template = $action->executeById($id);
        return $this->successResponse(new DocumentTemplateResource($template));
    }

    /**
     * Update a template and store its history.
     * Validates template structure before updating.
     */
    public function update(UpdateSystemTemplateRequest $request, $id, UpdateSystemTemplateAction $action): JsonResponse
    {
        $template = $action->execute($id, $request->validated());
        return $this->successResponse(new DocumentTemplateResource($template), 'Template updated and history recorded');
    }

    /**
     * Delete a template.
     */
    public function destroy($id, DeleteSystemTemplateAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse([], 'Template deactivated successfully');
    }

    /**
     * View history log of a template
     */
    public function history($id, SystemTemplateOperationsAction $action): JsonResponse
    {
        $histories = $action->getHistory($id);
        return $this->successResponse(DocumentTemplateHistoryResource::collection($histories), 'Template history fetched');
    }

    public function render(RenderSystemTemplateRequest $request, $id, SystemTemplateOperationsAction $action): JsonResponse
    {
        $validated = $request->validated();
        $renderedHtml = $action->render($id, $validated['context'], $validated['language'] ?? 'ar');

        return $this->successResponse(['rendered_html' => $renderedHtml], 'Template rendered successfully');
    }

    public function getApprovedKeys(GetSystemTemplateKeysRequest $request, SystemTemplateOperationsAction $action): JsonResponse
    {
        $keys = $action->getApprovedKeys($request->validated()['type']);
        return $this->successResponse($keys, 'Approved keys fetched');
    }
}