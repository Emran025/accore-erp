<?php

namespace App\Http\Resources\Assets\AssetLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                       => $this->id,
            'name'                     => $this->name,
            'description'              => $this->description,
            'status'                   => $this->status,
            'is_active'                => (bool) $this->is_active,
            'purchase_value'           => (float) $this->purchase_value,
            'salvage_value'            => (float) $this->salvage_value,
            'accumulated_depreciation' => (float) $this->accumulated_depreciation,
            'depreciation_rate'        => (float) $this->depreciation_rate,
            'depreciation_method'      => $this->depreciation_method,
            'useful_life_years'        => (int) $this->useful_life_years,
            'purchase_date'            => $this->purchase_date?->toDateString(),
            'created_by'               => $this->created_by,
            'recorder_name'            => $this->when(
                isset($this->recorder_name) || $this->relationLoaded('createdBy'),
                fn () => $this->recorder_name ?? $this->createdBy?->full_name
            ),
            'created_at'               => $this->created_at?->toDateTimeString(),
            'updated_at'               => $this->updated_at?->toDateTimeString(),
            'depreciations'            => AssetDepreciationResource::collection(
                $this->whenLoaded('depreciations')
            ),
        ];
    }
}
