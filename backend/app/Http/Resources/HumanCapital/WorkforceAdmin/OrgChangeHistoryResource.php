<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class OrgChangeHistoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'entity_type'   => $this->entity_type,
            'entity_id'     => $this->entity_id,
            'change_type'   => $this->change_type,
            'old_values'    => $this->old_values,
            'new_values'    => $this->new_values,
            'change_reason' => $this->change_reason ?? null,
            'changed_by'    => $this->changed_by,
            'created_at'    => $this->created_at?->toDateTimeString(),
        ];
    }
}
