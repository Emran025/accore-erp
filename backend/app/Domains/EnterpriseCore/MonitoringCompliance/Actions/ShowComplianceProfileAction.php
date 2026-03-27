<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class ShowComplianceProfileAction
{
    public function execute(int $id): ComplianceProfile
    {
        return ComplianceProfile::with('taxAuthority')->findOrFail($id);
    }
}
