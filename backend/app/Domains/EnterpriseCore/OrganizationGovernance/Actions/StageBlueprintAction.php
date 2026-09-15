<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\OrgBlueprint;
use Illuminate\Support\Str;

class StageBlueprintAction
{
    /**
     * @param array<string, mixed> $data
     * @return OrgBlueprint
     */
    public function execute(array $data): OrgBlueprint
    {
        $uuid = $data['blueprint_uuid'] ?? (string) Str::uuid();

        return OrgBlueprint::updateOrCreate(
            ['blueprint_uuid' => $uuid],
            [
                'name'           => $data['name'],
                'archetype_id'   => $data['archetype_id'],
                'blueprint_json' => $data['blueprint_json'],
                'status'         => 'staged',
                'created_by'     => auth()->id(),
            ]
        );
    }
}
