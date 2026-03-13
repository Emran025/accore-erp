<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateRegistry;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class ShowSystemTemplateAction
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

    public function executeByKey(string $key): array
    {
        $template = DocumentTemplate::where('template_key', $key)
            ->where('is_active', true)
            ->firstOrFail();
            
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }
        
        return $template->toArray();
    }

    public function executeById(int|string $id): array
    {
        $template = DocumentTemplate::findOrFail($id);
            
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }
        
        return $template->toArray();
    }

    public function executeByType(string $type): array
    {
        $template = $this->templateService->getTemplate($type);
            
        if (!$template) {
            throw new \Exception("No active template found for type '{$type}'");
        }
        
        return $template->toArray();
    }
}
