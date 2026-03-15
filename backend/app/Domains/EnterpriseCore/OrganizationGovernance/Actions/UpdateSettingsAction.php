<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

class UpdateSettingsAction
{
    public function execute(array $settings): bool
    {
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }

        return true;
    }
}
