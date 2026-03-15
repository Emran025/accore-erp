<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;

class GetHrDocumentTemplateApprovedKeysAction
{
    public function __construct(private readonly TemplateService $templateService) {}

    public function execute(string $type): array
    {
        return $this->templateService->getApprovedKeysForType($type);
    }
}
