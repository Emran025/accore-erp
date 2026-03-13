<?php

namespace App\Domains\HumanCapital\DocumentManagement\Actions;

use App\Domains\EnterpriseCore\Governance\Models\DocumentTemplate;

class ListHrDocumentTemplatesAction
{
    private const HR_TYPES = [
        'contract', 'clearance', 'warning', 'id_card',
        'handover', 'certificate', 'memo', 'other',
        'employee_certificate', 'employee_contract',
    ];

    public function execute(array $filters): array
    {
        $query = DocumentTemplate::whereIn('template_type', self::HR_TYPES);

        if (isset($filters['type']) && $filters['type'] !== '') {
            $query->where('template_type', $filters['type']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = $filters['search'];
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

        return $templates->toArray();
    }
}
