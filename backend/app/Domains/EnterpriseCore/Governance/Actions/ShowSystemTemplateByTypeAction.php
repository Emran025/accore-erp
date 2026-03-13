<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;
use Illuminate\Http\JsonResponse;

class ShowSystemTemplateByTypeAction extends Action
{
    public function __construct(
        private readonly string $type,
        private readonly TemplateService $templateService
    ) {}

    public function __invoke(): JsonResponse
    {
        try {
            $template = $this->templateService->getTemplate($this->type);

            if (!$template) {
                return $this->errorResponse(
                    "No active template found for type '{$this->type}'",
                    404
                );
            }

            return $this->successResponse($template->toArray());
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}

