<?php

namespace App\Http\Resources\Commercial\MarketingDistribution;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesRepresentativeResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'region'       => $this->region ?? null,
            'is_active'    => (bool) ($this->is_active ?? true),
            'created_by'   => $this->created_by,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
