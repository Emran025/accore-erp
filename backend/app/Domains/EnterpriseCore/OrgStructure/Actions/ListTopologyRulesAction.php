<?php
namespace App\Domains\EnterpriseCore\OrgStructure\Actions;

use App\Domains\EnterpriseCore\Governance\Models\TopologyRule;

class ListTopologyRulesAction
{
    public function execute(): array
    {
        return TopologyRule::with(['sourceType', 'targetType'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->toArray();
    }
}
