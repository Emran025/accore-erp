<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use Illuminate\Database\Eloquent\Collection;
class ListSettingsAction
{
    public function execute(): Collection
    {
        return Setting::all();
    }
}
