<?php

namespace App\Http\Resources\Assets\AssetLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\HumanCapital\WorkforceAdmin\EmployeeResource;

class AssetResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'asset_code' => $this->asset_code,
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'serial_number' => $this->serial_number,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'purchase_cost' => (float)$this->purchase_cost,
            'current_value' => (float)$this->current_value,
            'status' => $this->status,
            'location' => $this->location,
            'is_active' => (bool)$this->is_active,
            'created_at' => $this->created_at?->toDateTimeString(),

            // Relationships
            'assigned_to' => new EmployeeResource($this->whenLoaded('assignedTo')),
        ];
    }
}
