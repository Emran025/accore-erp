<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use Illuminate\Http\JsonResponse;

class ShowSystemTemplateAction extends Action
{
    public function __construct(private readonly int $id) {}

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    public function __invoke(): JsonResponse
    {
        try {
            $template = DocumentTemplate::findOrFail($this->id);

            if (!$this->isSystemType($template->template_type)) {
                return $this->errorResponse('Template is not a system template', 403);
            }

            return $this->successResponse($template->toArray());
        } catch (\Exception $e) {
            return $this->errorResponse('Template not found', 404);
        }
    }
}

