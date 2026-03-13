<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;
use App\Domains\HumanCapital\DocumentManagement\Services\EmployeeContextBuilder;

class RenderHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(int $id, array $data): array
    {
        $template = DocumentTemplate::findOrFail($id);
        
        $employee = Employee::with(['role', 'department', 'currentContract'])->findOrFail($data['employee_id']);
        $context = EmployeeContextBuilder::build($employee, $data['custom_fields'] ?? []);
        
        $renderedHtml = $this->templateService->renderTemplate(
            $template->id,
            $context,
            $data['language'] ?? 'ar'
        );
        
        return [
            'rendered_html' => $renderedHtml,
            'template' => $template->toArray(),
            'employee' => $employee->toArray(),
        ];
    }
}
