<?php

namespace App\Http\Controllers\Api\V2\DigitalPlatform\Automation;

use App\Http\Controllers\Controller;
use App\Http\Requests\DigitalPlatform\Automation\StoreSystemTemplateRequest;
use App\Http\Requests\DigitalPlatform\Automation\UpdateSystemTemplateRequest;
use App\Http\Requests\DigitalPlatform\Automation\RenderSystemTemplateRequest;
use App\Http\Requests\DigitalPlatform\Automation\GetSystemTemplateKeysRequest;
use App\Domains\DigitalPlatform\Automation\Actions\ListSystemTemplatesAction;
use App\Domains\DigitalPlatform\Automation\Actions\CreateSystemTemplateAction;
use App\Domains\DigitalPlatform\Automation\Actions\ShowSystemTemplateAction;
use App\Domains\DigitalPlatform\Automation\Actions\UpdateSystemTemplateAction;
use App\Domains\DigitalPlatform\Automation\Actions\DeleteSystemTemplateAction;
use App\Domains\DigitalPlatform\Automation\Actions\SystemTemplateOperationsAction;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateRegistry;
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
            return $this->successResponse($templates);
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
            $template = $action->execute($validated);
            return $this->successResponse($template, 'Template created successfully');
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
            $template = $action->executeByKey($key);
            return $this->successResponse($template);
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
            $template = $action->executeByType($type);
            return $this->successResponse($template);
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
            $template = $action->executeById($id);
            return $this->successResponse($template);
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
            $template = $action->execute($id, $validated);
            return $this->successResponse($template, 'Template updated and history recorded');
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
            return $this->successResponse($histories, 'Template history fetched');
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