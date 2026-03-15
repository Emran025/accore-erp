<?php

namespace App\Http\Resources\Assets\AssetLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class AssetDepreciationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                       => $this->id,
            'asset_id'                 => $this->asset_id,
            'fiscal_period_id'         => $this->fiscal_period_id,
            'depreciation_date'        => $this->depreciation_date?->toDateString(),
            'depreciation_amount'      => (float) $this->depreciation_amount,
            'accumulated_depreciation' => (float) $this->accumulated_depreciation,
            'book_value'               => (float) $this->book_value,
            'created_by'               => $this->created_by,
            'created_at'               => $this->created_at?->toDateTimeString(),
            'asset'                    => new AssetResource($this->whenLoaded('asset')),
        ];
    }
}
