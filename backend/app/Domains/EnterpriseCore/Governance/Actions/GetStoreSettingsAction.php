<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\EnterpriseCore\Governance\Models\Setting;

class GetStoreSettingsAction
{
    public function execute()
    {
        $keys = ['store_name', 'store_address', 'store_phone', 'store_email', 'tax_number', 'cr_number'];
        $settings = Setting::whereIn('setting_key', $keys)->pluck('setting_value', 'setting_key')->toArray();
        
        // Ensure all keys exist
        foreach ($keys as $key) {
            if (!isset($settings[$key])) $settings[$key] = '';
        }
        
        return $settings;
    }
}
