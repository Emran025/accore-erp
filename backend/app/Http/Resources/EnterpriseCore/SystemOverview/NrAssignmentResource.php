<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class NrAssignmentResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'nr_object_id'   => $this->nr_object_id,
            'nr_group_id'    => $this->nr_group_id,
            'nr_interval_id' => $this->nr_interval_id,
            'is_active'      => (bool) $this->is_active,
            'created_at'     => $this->created_at?->toDateTimeString(),
            'group'          => new NrGroupResource($this->whenLoaded('group')),
            'interval'       => new NrIntervalResource($this->whenLoaded('interval')),
        ];
    }
}
