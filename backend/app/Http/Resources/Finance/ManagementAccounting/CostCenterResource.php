<?php

namespace App\Http\Resources\Finance\ManagementAccounting;

use Illuminate\Http\Resources\Json\JsonResource;

class CostCenterResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'code'        => $this->code,
            'name'        => $this->name,
            'name_en'     => $this->name_en ?? null,
            'parent_id'   => $this->parent_id,
            'is_active'   => (bool) ($this->is_active ?? true),
            'description' => $this->description ?? null,
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
            'parent'      => new CostCenterResource($this->whenLoaded('parent')),
            'children'    => CostCenterResource::collection($this->whenLoaded('children')),
        ];
    }
}
