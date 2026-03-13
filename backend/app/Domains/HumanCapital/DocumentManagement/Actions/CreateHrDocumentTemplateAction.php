<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class CreateHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(array $data): array
    {
        $validation = $this->templateService->validateTemplate($data['template_type'], $data['body_html']);
        if (!$validation['valid']) {
            throw new \Exception('Template validation failed: ' . implode(', ', $validation['errors']));
        }
        $template = $this->templateService->createTemplate($data);
        return $template->toArray();
    }
}
