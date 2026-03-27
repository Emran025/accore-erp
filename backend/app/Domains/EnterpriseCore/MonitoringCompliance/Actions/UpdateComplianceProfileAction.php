<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class UpdateComplianceProfileAction
{
    public function execute(int $id, array $data): ComplianceProfile
    {
        $profile = ComplianceProfile::findOrFail($id);

        // Prevent code mutation
        unset($data['code']);

        // If switching from pull → push, revoke any existing token
        if (isset($data['policy_type']) && $data['policy_type'] === 'push' && $profile->isPull()) {
            $profile->revokeToken();
        }

        $profile->update($data);

        // If switching from push → pull and no token exists, auto-generate
        if ($profile->isPull() && !$profile->access_token) {
            $profile->generateAccessToken();
        }

        return $profile->fresh()->load('taxAuthority');
    }
}
