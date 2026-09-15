<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgBlueprintResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'blueprint_uuid' => $this->blueprint_uuid,
            'name'           => $this->name,
            'archetype_id'   => $this->archetype_id,
            'status'         => $this->status,
            'blueprint_json' => $this->blueprint_json ?? [],
            'created_by'     => $this->created_by,
            'compiled_at'    => $this->compiled_at?->toDateTimeString(),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
