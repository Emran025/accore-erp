<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;
use App\Domains\HumanCapital\HRAdvanced\Services\TemplateRegistry;
use Illuminate\Database\Eloquent\Collection;

class ListSystemTemplatesAction
{
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

    public function execute(array $filters = []): Collection
    {
        $approvedTypes = $this->getSystemTypes();
        
        $query = DocumentTemplate::whereIn('template_type', $approvedTypes);

        if (!empty($filters['type'])) {
            if (!$this->isSystemType($filters['type'])) {
                throw new \Exception("Template type '{$filters['type']}' is not an approved system type");
            }
            $query->where('template_type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('template_name_ar', 'like', "%{$search}%")
                  ->orWhere('template_name_en', 'like', "%{$search}%")
                  ->orWhere('template_key', 'like', "%{$search}%");
            });
        }

        return $query->where('is_active', true)
            ->orderBy('template_type')
            ->orderBy('template_name_ar')
            ->get();
    }
}
