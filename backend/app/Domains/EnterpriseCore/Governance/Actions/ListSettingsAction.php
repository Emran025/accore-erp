<?php

namespace App\Domains\EnterpriseCore\Governance\Actions;

use App\Domains\EnterpriseCore\Governance\Models\Setting;

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
