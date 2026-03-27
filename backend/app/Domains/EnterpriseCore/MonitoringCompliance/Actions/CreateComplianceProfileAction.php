<?php

namespace App\Domains\EnterpriseCore\MonitoringCompliance\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ComplianceProfile;

use Illuminate\Support\Collection;

class CreateComplianceProfileAction
{
    public function execute(array $data): Collection
    {
        $profile = ComplianceProfile::create($data);

        $rawToken = null;
        if ($profile->isPull()) {
            $rawToken = $profile->generateAccessToken();
        }

        $response = ['profile' => $profile->load('taxAuthority')];

        if ($rawToken) {
            $response['access_token'] = $rawToken;
        }

        return collect($response);
    }
}
