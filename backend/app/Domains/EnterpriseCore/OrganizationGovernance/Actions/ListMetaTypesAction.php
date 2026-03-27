<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgMetaType;
use Illuminate\Database\Eloquent\Collection;
class ListMetaTypesAction
{
    public function execute(array $filters = []): Collection
    {
        $query = OrgMetaType::with('attributes')->orderBy('sort_order');

        if (!empty($filters['level_domain'])) {
            $query->where('level_domain', $filters['level_domain']);
        }

        return $query->get();
    }
}
