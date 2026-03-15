<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class ShowComplianceProfileAction
{
    public function execute(int $id): array
    {
        $profile = ComplianceProfile::with('taxAuthority')->findOrFail($id);

        return ['profile' => $profile];
    }
}
