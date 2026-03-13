<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;

class SystemTemplateOperationsAction
{
    protected TemplateService $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    public function getHistory(int|string $id): array
    {
        return $this->templateService->getTemplateHistory($id)->toArray();
    }

    public function render(int|string $id, array $context, string $language = 'ar'): string
    {
        return $this->templateService->renderTemplate($id, $context, $language);
    }

    public function getApprovedKeys(string $type): array
    {
        return $this->templateService->getApprovedKeysForType($type);
    }
}
