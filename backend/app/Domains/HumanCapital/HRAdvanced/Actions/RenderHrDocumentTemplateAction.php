<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use App\Domains\HumanCapital\HRAdvanced\Services\EmployeeContextBuilder;
use Illuminate\Support\Collection;
class RenderHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(int $id, array $data): Collection
    {
        $template = DocumentTemplate::findOrFail($id);
        
        $employee = Employee::with(['role', 'department', 'currentContract'])->findOrFail($data['employee_id']);
        $context = EmployeeContextBuilder::build($employee, $data['custom_fields'] ?? []);
        
        $renderedHtml = $this->templateService->renderTemplate(
            $template->id,
            $context,
            $data['language'] ?? 'ar'
        );
        
        return collect([
            'rendered_html' => $renderedHtml,
            'template' => $template->toArray(),
            'employee' => $employee->toArray(),
        ]);
    }
}
