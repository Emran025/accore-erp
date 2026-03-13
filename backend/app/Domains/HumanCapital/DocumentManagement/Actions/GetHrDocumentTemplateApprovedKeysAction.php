<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class GetHrDocumentTemplateApprovedKeysAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(string $type): array
    {
        return $this->templateService->getApprovedKeysForType($type);
    }
}
