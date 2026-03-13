<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateRegistry;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class DeleteSystemTemplateAction
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

    public function execute(int|string $id): void
    {
        $template = DocumentTemplate::findOrFail($id);
            
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }
        
        $this->templateService->deactivateTemplate($id);
    }
}
