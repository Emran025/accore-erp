<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use Illuminate\Http\JsonResponse;

class ListSystemTemplateHistoryAction extends Action
{
    public function __construct(
        private readonly int $id,
        private readonly TemplateService $templateService
    ) {}

    public function __invoke(): JsonResponse
    {
        try {
            $histories = $this->templateService->getTemplateHistory($this->id);

            return $this->successResponse(
                $histories->toArray(),
                'Template history fetched'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Template not found', 404);
        }
    }
}

