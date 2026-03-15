<?php

namespace App\Http\Resources\Finance\GeneralLedger;

use Illuminate\Http\Resources\Json\JsonResource;

class ChartOfAccountResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'account_code' => $this->account_code,
            'account_name' => $this->account_name,
            'account_type' => $this->account_type,
            'parent_id'    => $this->parent_id,
            'is_active'    => (bool) $this->is_active,
            'description'  => $this->description,
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
            'parent'       => new ChartOfAccountResource($this->whenLoaded('parent')),
            'children'     => ChartOfAccountResource::collection($this->whenLoaded('children')),
        ];
    }
}
