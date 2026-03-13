<?php

namespace App\Domains\DigitalPlatform\Compliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

class ServeCompliancePullDataAction
{
    /**
     * @return array{success: bool, data?: array, error?: string, error_code?: string, status?: int, headers?: array}
     */
    public function execute(string $code, ?string $bearerToken, ?string $clientIp): array
    {
        if (!$bearerToken) {
            return [
                'success'    => false,
                'error'      => 'Access token required',
                'error_code' => 'MISSING_TOKEN',
                'status'     => 401,
            ];
        }

        $profile = ComplianceProfile::findByToken($bearerToken);
        if (!$profile) {
            return [
                'success'    => false,
                'error'      => 'Invalid or expired access token',
                'error_code' => 'INVALID_TOKEN',
                'status'     => 401,
            ];
        }

        if (strtoupper($profile->code) !== strtoupper($code)) {
            return [
                'success'    => false,
                'error'      => 'Profile code mismatch',
                'error_code' => 'CODE_MISMATCH',
                'status'     => 403,
            ];
        }

        if (!$profile->isIpAllowed($clientIp)) {
            return [
                'success'    => false,
                'error'      => 'IP address not allowed',
                'error_code' => 'IP_BLOCKED',
                'status'     => 403,
            ];
        }

        return [
            'success' => true,
            'data'    => [
                'profile_code' => $profile->code,
                'format'       => $profile->transmission_format,
                'generated_at' => now()->toIso8601String(),
                'data'         => [],
                'message'      => 'Pull endpoint active. Connect to tax engine for live data.',
            ],
            'headers' => [
                'Content-Type'    => $profile->getContentType(),
                'X-Profile-Code'  => $profile->code,
                'X-Generated-At'  => now()->toIso8601String(),
            ],
        ];
    }
}
