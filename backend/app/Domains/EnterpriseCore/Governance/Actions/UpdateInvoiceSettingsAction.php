<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\EnterpriseCore\Governance\Models\Setting;

class UpdateInvoiceSettingsAction
{
    public function execute(array $settings)
    {
        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }
        
        return true;
    }
}
