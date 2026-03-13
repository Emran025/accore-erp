<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class ListComplianceProfilesAction
{
    public function execute(array $filters = []): array
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

        $profiles = $query->orderBy('created_at', 'desc')->get();

        return ['profiles' => $profiles];
    }
}
