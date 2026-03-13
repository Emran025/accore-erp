<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;
use App\Domains\HumanCapital\DocumentManagement\Services\TemplateRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListSystemTemplatesAction extends Action
{
    public function __construct(private readonly Request $request) {}

    protected function isSystemType(string $type): bool
    {
        $meta = TemplateRegistry::getTypeMetadata($type);
        return $meta && isset($meta['module']) && $meta['module'] !== 'hr';
    }

    protected function getSystemTypes(): array
    {
        $types = [];
        foreach (TemplateRegistry::getApprovedTypes() as $type => $meta) {
            if (isset($meta['module']) && $meta['module'] !== 'hr') {
                $types[] = $type;
            }
        }
        return $types;
    }

    public function __invoke(): JsonResponse
    {
        $approvedTypes = $this->getSystemTypes();

        $query = DocumentTemplate::whereIn('template_type', $approvedTypes);

        if ($this->request->filled('type')) {
            if (!$this->isSystemType($this->request->type)) {
                return $this->errorResponse(
                    "Template type '{$this->request->type}' is not an approved system type",
                    400
                );
            }
            $query->where('template_type', $this->request->type);
        }

        if ($this->request->filled('search')) {
            $search = $this->request->search;
            $query->where(function ($q) use ($search) {
                $q->where('template_name_ar', 'like', "%{$search}%")
                    ->orWhere('template_name_en', 'like', "%{$search}%")
                    ->orWhere('template_key', 'like', "%{$search}%");
            });
        }

        $templates = $query->where('is_active', true)
            ->orderBy('template_type')
            ->orderBy('template_name_ar')
            ->get();

        return $this->successResponse($templates->toArray());
    }
}

