<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgBlueprintResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'blueprint_uuid'   => $this->blueprint_uuid,
            'name'             => $this->name,
            // Column name in org_blueprints is primary_archetype (see migration 2026_09_15_000001)
            'primary_archetype' => $this->primary_archetype,
            'complexity_grade'  => $this->complexity_grade,
            'status'           => $this->status,
            'blueprint_json'   => $this->blueprint_json ?? [],
            'created_by'       => $this->created_by,
            // Column name in org_blueprints is published_at (see migration 2026_09_15_000001)
            'published_at'     => $this->published_at?->toDateTimeString(),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
