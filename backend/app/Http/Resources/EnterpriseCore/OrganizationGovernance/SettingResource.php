<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->setting_key,
            'key'         => $this->setting_key,
            'value'       => $this->setting_value,
            'group'       => $this->group ?? null,
            'type'        => $this->type ?? null,
            'description' => $this->description ?? null,
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
