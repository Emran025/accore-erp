<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateRegistry;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class UpdateSystemTemplateAction
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

    public function execute(int|string $id, array $data): array
    {
        $template = DocumentTemplate::findOrFail($id);
        
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }

        if (isset($data['template_type']) && !$this->isSystemType($data['template_type'])) {
            throw new \Exception('Cannot change to a non-system template type');
        }

        if (isset($data['body_html'])) {
            $type = $data['template_type'] ?? $template->template_type;
            $validation = $this->templateService->validateTemplate($type, $data['body_html']);
            if (!$validation['valid']) {
                throw new \Exception('Template validation failed: ' . implode(', ', $validation['errors']));
            }
        }

        $template = $this->templateService->updateTemplate($id, $data);
        return $template->toArray();
    }
}
