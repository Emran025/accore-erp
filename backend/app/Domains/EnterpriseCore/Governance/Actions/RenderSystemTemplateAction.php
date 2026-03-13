<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RenderSystemTemplateAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $id,
        private readonly TemplateService $templateService
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'context'   => 'required|array',
            'language'  => 'nullable|string|in:ar,en',
        ]);

        try {
            $renderedHtml = $this->templateService->renderTemplate(
                $this->id,
                $this->request->context,
                $this->request->language ?? 'ar'
            );

            return $this->successResponse(
                ['rendered_html' => $renderedHtml],
                'Template rendered successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}

