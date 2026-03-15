<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrGroupResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'group_key'   => $this->group_key,
            'group_name'  => $this->group_name,
            'description' => $this->description ?? null,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
