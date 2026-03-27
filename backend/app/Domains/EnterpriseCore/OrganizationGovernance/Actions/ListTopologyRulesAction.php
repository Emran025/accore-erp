<?php
namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\TopologyRule;
use Illuminate\Database\Eloquent\Collection;
class ListTopologyRulesAction
{
    public function execute(): Collection
    {
        return TopologyRule::with(['sourceType', 'targetType'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }
}
