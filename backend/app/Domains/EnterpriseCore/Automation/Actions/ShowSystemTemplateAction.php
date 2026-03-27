<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;

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

    public function executeByKey(string $key): DocumentTemplate
    {
        $template = DocumentTemplate::where('template_key', $key)
            ->where('is_active', true)
            ->firstOrFail();
            
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }
        
        return $template;
    }

    public function executeById(int|string $id): DocumentTemplate
    {
        $template = DocumentTemplate::findOrFail($id);
            
        if (!$this->isSystemType($template->template_type)) {
            throw new \Exception('Template is not a system template');
        }
        
        return $template;
    }

    public function executeByType(string $type): DocumentTemplate
    {
        $template = $this->templateService->getTemplate($type);
            
        if (!$template) {
            throw new \Exception("No active template found for type '{$type}'");
        }
        
        return $template;
    }
}
