<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class JobTitleResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'title_ar'      => $this->title_ar,
            'title_en'      => $this->title_en,
            'department_id' => $this->department_id,
            'description'   => $this->description ?? null,
            'is_active'     => (bool) $this->is_active,
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
            'department'    => new DepartmentResource($this->whenLoaded('department')),
        ];
    }
}
