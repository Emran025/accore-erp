<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class DeleteComplianceProfileAction
{
    public function execute(int $id): void
    {
        $profile = ComplianceProfile::findOrFail($id);
        $profile->delete();
    }
}
