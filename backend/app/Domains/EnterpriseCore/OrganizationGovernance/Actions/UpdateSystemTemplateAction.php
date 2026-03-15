<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateSystemTemplateAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $id,
        private readonly TemplateService $templateService
    ) {}

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'template_name_ar' => 'string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'string',
            'body_html'        => 'string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
            'is_active'        => 'boolean',
        ]);

        try {
            $template = DocumentTemplate::findOrFail($this->id);
            if (!$this->isSystemType($template->template_type)) {
                return $this->errorResponse('Template is not a system template', 403);
            }

            if (isset($validated['template_type']) && !$this->isSystemType($validated['template_type'])) {
                return $this->errorResponse('Cannot change to a non-system template type', 403);
            }

            if (isset($validated['body_html'])) {
                $type = $validated['template_type'] ?? $template->template_type;
                $validation = $this->templateService->validateTemplate($type, $validated['body_html']);
                if (!$validation['valid']) {
                    return $this->errorResponse(
                        'Template validation failed: ' . implode(', ', $validation['errors']),
                        422
                    );
                }
            }

            $updated = $this->templateService->updateTemplate($this->id, $validated);

            return $this->successResponse(
                $updated->toArray(),
                'Template updated and history recorded'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}

