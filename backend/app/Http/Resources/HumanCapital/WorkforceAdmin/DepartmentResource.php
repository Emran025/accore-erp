<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'name_ar'     => $this->name_ar,
            'name_en'     => $this->name_en,
            'description' => $this->description ?? null,
            'manager_id'  => $this->manager_id,
            'cost_center_id'   => $this->cost_center_id ?? null,
            'profit_center_id' => $this->profit_center_id ?? null,
            'is_active'   => (bool) $this->is_active,
            'created_at'  => $this->created_at?->toDateTimeString(),
            'updated_at'  => $this->updated_at?->toDateTimeString(),
        ];
    }
}
