<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use Illuminate\Database\Eloquent\Collection;

class SystemTemplateOperationsAction
{
    protected TemplateService $templateService;

    public function __construct(TemplateService $templateService)
    {
        $this->templateService = $templateService;
    }

    public function getHistory(int|string $id): Collection
    {
        return $this->templateService->getTemplateHistory($id);
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
