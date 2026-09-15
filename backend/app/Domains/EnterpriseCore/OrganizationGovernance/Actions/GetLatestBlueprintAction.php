<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;

class GetLatestBlueprintAction
{
    public function execute(): ?OrgBlueprint
    {
        return OrgBlueprint::latest('updated_at')->first();
    }
}
