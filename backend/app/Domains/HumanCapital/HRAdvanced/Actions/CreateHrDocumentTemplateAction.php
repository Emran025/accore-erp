<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;

class CreateHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(array $data): DocumentTemplate
    {
        $validation = $this->templateService->validateTemplate($data['template_type'], $data['body_html']);
        if (!$validation['valid']) {
            throw new \Exception('Template validation failed: ' . implode(', ', $validation['errors']));
        }
        return $this->templateService->createTemplate($data);
    }
}
