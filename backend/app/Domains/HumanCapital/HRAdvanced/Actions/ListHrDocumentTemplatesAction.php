<?php

namespace App\Domains\HumanCapital\HRAdvanced\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\DocumentTemplate;

use Illuminate\Support\Collection;

class ListHrDocumentTemplatesAction
{
    private const HR_TYPES = [
        'contract', 'clearance', 'warning', 'id_card',
        'handover', 'certificate', 'memo', 'other',
        'employee_certificate', 'employee_contract',
    ];

    public function execute(array $filters): Collection
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

        return $query->where('is_active', true)
            ->orderBy('template_type')
            ->orderBy('template_name_ar')
            ->get();
    }
}
