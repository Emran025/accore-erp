<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

class GetInvoiceSettingsAction
{
    public function execute()
    {
        $keys = ['show_logo', 'show_qr', 'zatca_enabled', 'footer_text', 'terms_text', 'invoice_size'];
        $settings = Setting::whereIn('setting_key', $keys)->pluck('setting_value', 'setting_key')->toArray();
        
        // Cast boolean values
        $settings['show_logo'] = isset($settings['show_logo']) ? filter_var($settings['show_logo'], FILTER_VALIDATE_BOOLEAN) : true;
        $settings['show_qr'] = isset($settings['show_qr']) ? filter_var($settings['show_qr'], FILTER_VALIDATE_BOOLEAN) : true;
        $settings['zatca_enabled'] = isset($settings['zatca_enabled']) ? filter_var($settings['zatca_enabled'], FILTER_VALIDATE_BOOLEAN) : false;

        foreach ($keys as $key) {
            if (!isset($settings[$key])) $settings[$key] = '';
        }
        
        return $settings;
    }
}
