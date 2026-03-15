<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateSystemTemplateAction extends Action
{
    public function __construct(
        private readonly Request $request,
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
            'template_key'     => 'required|string|max:50|unique:document_templates,template_key',
            'template_name_ar' => 'required|string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'required|string',
            'body_html'        => 'required|string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
        ]);

        if (!$this->isSystemType($validated['template_type'])) {
            return $this->errorResponse(
                "Template type '{$validated['template_type']}' is not an approved system type.",
                403
            );
        }

        try {
            $validation = $this->templateService->validateTemplate(
                $validated['template_type'],
                $validated['body_html']
            );
            if (!$validation['valid']) {
                return $this->errorResponse(
                    'Template validation failed: ' . implode(', ', $validation['errors']),
                    422
                );
            }

            $template = $this->templateService->createTemplate($validated);

            return $this->successResponse(
                $template->toArray(),
                'Template created successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}

