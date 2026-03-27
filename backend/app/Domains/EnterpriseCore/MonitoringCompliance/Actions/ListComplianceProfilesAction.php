<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;
use Illuminate\Database\Eloquent\Collection;
class ListComplianceProfilesAction
{
    public function execute(array $filters = []): Collection
    {
        $query = ComplianceProfile::with('taxAuthority');

        if (!empty($filters['tax_authority_id'])) {
            $query->forAuthority($filters['tax_authority_id']);
        }

        if (!empty($filters['policy_type'])) {
            $query->where('policy_type', $filters['policy_type']);
        }

        if (!empty($filters['active_only'])) {
            $query->active();
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}
