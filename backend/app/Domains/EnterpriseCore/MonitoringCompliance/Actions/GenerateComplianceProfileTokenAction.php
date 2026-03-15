<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class GenerateComplianceProfileTokenAction
{
    /**
     * @return array{success: bool, data?: array, error?: string}
     */
    public function execute(int $id, array $data = []): array
    {
        $profile = ComplianceProfile::findOrFail($id);

        if (!$profile->isPull()) {
            return [
                'success' => false,
                'error'   => 'Token generation is only available for pull-type profiles.',
            ];
        }

        $token = $profile->generateAccessToken($data['expires_in_days'] ?? 365);

        return [
            'success' => true,
            'data'    => [
                'access_token'     => $token,
                'token_expires_at' => $profile->fresh()->token_expires_at,
                'pull_endpoint'    => $profile->pull_endpoint,
            ],
        ];
    }
}
