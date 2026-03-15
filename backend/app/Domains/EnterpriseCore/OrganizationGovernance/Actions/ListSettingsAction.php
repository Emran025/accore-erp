<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

class ListSettingsAction
{
    public function execute(): array
    {
        $settings = Setting::all()
            ->pluck('setting_value', 'setting_key')
            ->toArray();

        return ['settings' => $settings];
    }
}
