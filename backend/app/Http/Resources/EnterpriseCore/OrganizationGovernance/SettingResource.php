<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'key'         => $this->key,
            'value'       => $this->value,
            'group'       => $this->group ?? null,
            'type'        => $this->type ?? null,
            'description' => $this->description ?? null,
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
