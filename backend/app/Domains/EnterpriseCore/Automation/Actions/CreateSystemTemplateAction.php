<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;

class CreateSystemTemplateAction
{
    protected TemplateService $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    public function execute(array $data): array
    {
        if (!$this->isSystemType($data['template_type'])) {
            throw new \Exception("Template type '{$data['template_type']}' is not an approved system type.");
        }

        $validation = $this->templateService->validateTemplate($data['template_type'], $data['body_html']);
        if (!$validation['valid']) {
            throw new \Exception('Template validation failed: ' . implode(', ', $validation['errors']));
        }

        $template = $this->templateService->createTemplate($data);
        return $template->toArray();
    }
}
