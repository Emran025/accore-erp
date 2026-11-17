<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;

use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class UpdateSettingsAction
{
    public function execute(array $settings): Collection
    {
        foreach (array_keys($settings) as $key) {
            if (str_starts_with((string) $key, 'setup.')) {
                throw ValidationException::withMessages([
                    'settings' => 'Setup settings must be changed through the revision-protected setup API.',
                ]);
            }
        }

        $updated = [];
        foreach ($settings as $key => $value) {
            $updated[] = Setting::updateOrCreate(['setting_key' => $key], ['setting_value' => $value]);
        }

        return collect($updated);
    }
}
