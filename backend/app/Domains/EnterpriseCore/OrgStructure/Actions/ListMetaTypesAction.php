<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\EnterpriseCore\OrgStructure\Models\OrgMetaType;

class ListMetaTypesAction
{
    public function execute(array $filters = []): array
    {
        $query = OrgMetaType::with('attributes')->orderBy('sort_order');

        if (!empty($filters['level_domain'])) {
            $query->where('level_domain', $filters['level_domain']);
        }

        return $query->get()->toArray();
    }
}
