<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class DeleteHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(int $id): array
    {
        $this->templateService->deactivateTemplate($id);
        return [];
    }
}
