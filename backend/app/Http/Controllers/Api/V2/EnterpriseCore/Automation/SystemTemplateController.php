<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\Automation;

use App\Http\Controllers\Controller;
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
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\DocumentTemplateResource;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\DocumentTemplateHistoryResource;
use Illuminate\Http\Request;
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

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    protected function getSystemTypes(): array
    {
        $types = [];
        foreach (TemplateRegistry::getApprovedTypes() as $type => $meta) {
            if (isset($meta['module']) && $meta['module'] !== 'hr') {
                $types[] = $type;
            }
        }
        return $types;
    }

    /**
     * List all system templates.
     * Only returns templates from approved system types.
     */
    public function index(Request $request, ListSystemTemplatesAction $action): JsonResponse
    {
        try {
            $filters = $request->only(['type', 'search']);
            $templates = $action->execute($filters);
            return $this->successResponse(DocumentTemplateResource::collection($templates));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Store a new system template.
     * Validates template structure and keys before creation.
     */
    public function store(StoreSystemTemplateRequest $request, CreateSystemTemplateAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($validated);
            $template = DocumentTemplate::find($result['id'] ?? $result);
            return $this->successResponse(new DocumentTemplateResource($template), 'Template created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Show a specific system template by its unique key.
     */
    public function showByKey($key, ShowSystemTemplateAction $action): JsonResponse
    {
        try {
            $result = $action->executeByKey($key);
            $template = DocumentTemplate::where('template_key', $key)->first();
            return $this->successResponse(new DocumentTemplateResource($template));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Show the latest active template of a specific type.
     */
    public function showByType($type, ShowSystemTemplateAction $action): JsonResponse
    {
        try {
            $result = $action->executeByType($type);
            $template = DocumentTemplate::where('template_type', $type)->where('is_active', true)->first();
            return $this->successResponse(new DocumentTemplateResource($template));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Show a specific system template.
     */
    public function show($id, ShowSystemTemplateAction $action): JsonResponse
    {
        try {
            $result = $action->executeById($id);
            $template = DocumentTemplate::find($id);
            return $this->successResponse(new DocumentTemplateResource($template));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Update a template and store its history.
     * Validates template structure before updating.
     */
    public function update(UpdateSystemTemplateRequest $request, $id, UpdateSystemTemplateAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($id, $validated);
            $template = DocumentTemplate::find($id);
            return $this->successResponse(new DocumentTemplateResource($template), 'Template updated and history recorded');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete a template.
     */
    public function destroy($id, DeleteSystemTemplateAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Template deactivated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * View history log of a template
     */
    public function history($id, SystemTemplateOperationsAction $action): JsonResponse
    {
        try {
            $histories = $action->getHistory($id);
            $template = DocumentTemplate::with('history')->find($id);
            return $this->successResponse(DocumentTemplateHistoryResource::collection($template->history), 'Template history fetched');
        } catch (\Exception $e) {
            return $this->errorResponse('Template not found', 404);
        }
    }

    /**
     * Render a template with provided context data.
     * This endpoint allows modules to render templates with their data.
     */
    public function render(RenderSystemTemplateRequest $request, $id, SystemTemplateOperationsAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $renderedHtml = $action->render(
                $id,
                $validated['context'],
                $validated['language'] ?? 'ar'
            );

            return $this->successResponse([
                'rendered_html' => $renderedHtml,
            ], 'Template rendered successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get approved keys for a template type.
     * Useful for template editors to show available placeholders.
     */
    public function getApprovedKeys(GetSystemTemplateKeysRequest $request, SystemTemplateOperationsAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            if (!$this->isSystemType($validated['type'])) {
                return $this->errorResponse("Template type '{$validated['type']}' is not an approved system type", 400);
            }

            $keys = $action->getApprovedKeys($validated['type']);
            return $this->successResponse($keys, 'Approved keys fetched');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}