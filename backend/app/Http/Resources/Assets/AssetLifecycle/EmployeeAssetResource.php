<?php

namespace App\Http\Resources\Assets\AssetLifecycle;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeAssetResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'employee_id'           => $this->employee_id,
            'inventory_asset_id'    => $this->inventory_asset_id,
            'asset_code'            => $this->asset_code,
            'asset_name'            => $this->asset_name,
            'asset_type'            => $this->asset_type,
            'serial_number'         => $this->serial_number,
            'qr_code'               => $this->qr_code,
            'status'                => $this->status,
            'condition_on_return'   => $this->condition_on_return,
            'condition_notes'       => $this->condition_notes,
            'notes'                 => $this->notes,
            'cost_center_id'        => $this->cost_center_id,
            'project_id'            => $this->project_id,
            'allocation_date'       => $this->allocation_date?->toDateString(),
            'return_date'           => $this->return_date?->toDateString(),
            'next_maintenance_date' => $this->next_maintenance_date?->toDateString(),
            'maintenance_notes'     => $this->maintenance_notes,
            'created_by'            => $this->created_by,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'deleted_at'            => $this->when($this->deleted_at, fn () => $this->deleted_at?->toDateTimeString()),
        ];
    }
}
