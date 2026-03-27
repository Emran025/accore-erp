<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;

class UpdateHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(int $id, array $data): DocumentTemplate
    {
        if (isset($data['body_html'])) {
            $type = $data['template_type'] ?? DocumentTemplate::findOrFail($id)->template_type;
            $validation = $this->templateService->validateTemplate($type, $data['body_html']);
            if (!$validation['valid']) {
                throw new \Exception('Template validation failed: ' . implode(', ', $validation['errors']));
            }
        }
        $template = $this->templateService->updateTemplate($id, $data);
        return $template;
    }
}
