<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class RevokeComplianceProfileTokenAction
{
    /**
     * @return array{success: bool, error?: string}
     */
    public function execute(int $id): array
    {
        $profile = ComplianceProfile::findOrFail($id);

        if (!$profile->isPull()) {
            return [
                'success' => false,
                'error'   => 'Token revocation is only available for pull-type profiles.',
            ];
        }

        $profile->revokeToken();

        return ['success' => true];
    }
}
