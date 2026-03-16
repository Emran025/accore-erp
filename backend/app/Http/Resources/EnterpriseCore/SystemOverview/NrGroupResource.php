<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrGroupResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'code'         => $this->code,
            'name'         => $this->name,
            'name_en'      => $this->name_en,
            'description'  => $this->description,
            'is_active'    => (bool) $this->is_active,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
            'intervals'    => NrIntervalResource::collection($this->whenLoaded('intervals')),
        ];
    }
}
