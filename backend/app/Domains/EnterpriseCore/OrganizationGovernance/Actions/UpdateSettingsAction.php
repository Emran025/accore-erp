<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

use Illuminate\Support\Collection;

class UpdateSettingsAction
{
    public function execute(array $settings): Collection
    {
        $updated = [];
        foreach ($settings as $key => $value) {
            $updated[] = Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }

        return collect($updated);
    }
}
