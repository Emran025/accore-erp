<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

class UpdateStoreSettingsAction
{
    public function execute(array $settings)
    {
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }
        
        return true;
    }
}
