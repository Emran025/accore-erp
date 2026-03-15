<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrObjectResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'object_key'  => $this->object_key,
            'object_name' => $this->object_name,
            'description' => $this->description ?? null,
            'is_active'   => (bool) ($this->is_active ?? true),
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
