<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetApprovedTemplateKeysAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly TemplateService $templateService
    ) {}

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'type' => 'required|string',
        ]);

        try {
            if (!$this->isSystemType($this->request->type)) {
                return $this->errorResponse(
                    "Template type '{$this->request->type}' is not an approved system type",
                    400
                );
            }

            $keys = $this->templateService->getApprovedKeysForType($this->request->type);

            return $this->successResponse($keys, 'Approved keys fetched');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}

