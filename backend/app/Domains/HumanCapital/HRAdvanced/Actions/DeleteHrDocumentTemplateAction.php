<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;

class DeleteHrDocumentTemplateAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(int $id): array
    {
        $this->templateService->deactivateTemplate($id);
        return [];
    }
}
