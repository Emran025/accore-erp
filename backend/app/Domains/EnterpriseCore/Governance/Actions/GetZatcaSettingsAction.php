<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\EnterpriseCore\Governance\Models\Setting;

class GetZatcaSettingsAction
{
    public function execute()
    {
        $keys = [
            'zatca_enabled',
            'zatca_environment',
            'zatca_vat_number',
            'zatca_org_name',
            'zatca_org_unit_name',
            'zatca_country_name',
            'zatca_common_name',
            'zatca_business_category',
            'zatca_otp',
            'zatca_csr',
            'zatca_private_key',
            'zatca_binary_token',
            'zatca_secret',
            'zatca_request_id',
            'zatca_compliance_status'
        ];
        
        $settings = Setting::whereIn('setting_key', $keys)->pluck('setting_value', 'setting_key')->toArray();
        
        // Default values
        if (!isset($settings['zatca_environment'])) $settings['zatca_environment'] = 'sandbox';
        if (!isset($settings['zatca_country_name'])) $settings['zatca_country_name'] = 'SA';
        if (!isset($settings['zatca_enabled'])) $settings['zatca_enabled'] = false;

        foreach ($keys as $key) {
            if (!isset($settings[$key])) $settings[$key] = '';
        }
        
        // Cast boolean
        $settings['zatca_enabled'] = filter_var($settings['zatca_enabled'], FILTER_VALIDATE_BOOLEAN);

        return $settings;
    }
}
