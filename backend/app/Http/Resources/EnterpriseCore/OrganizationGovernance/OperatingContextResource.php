<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OperatingContextResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'org_node_uuid' => $this->org_node_uuid,
            'warehouse_id' => $this->warehouse_id,
            'pos_terminal_id' => $this->pos_terminal_id,
            'cost_center_id' => $this->cost_center_id,
            'profit_center_id' => $this->profit_center_id,
            'status' => $this->status,
            'is_default' => (bool) $this->is_default,
            'scope' => $this->user_id === null ? 'organization' : 'personal',
            'warehouse' => $this->whenLoaded('warehouse', fn () => [
                'id' => $this->warehouse?->id,
                'code' => $this->warehouse?->code,
                'name' => $this->warehouse?->name,
                'name_en' => $this->warehouse?->name_en,
                'is_active' => (bool) $this->warehouse?->is_active,
            ]),
            'pos_terminal' => $this->whenLoaded('posTerminal', fn () => [
                'id' => $this->posTerminal?->id,
                'code' => $this->posTerminal?->code,
                'name' => $this->posTerminal?->name,
                'name_en' => $this->posTerminal?->name_en,
                'is_active' => (bool) $this->posTerminal?->is_active,
            ]),
            'cost_center' => $this->whenLoaded('costCenter', fn () => [
                'id' => $this->costCenter?->id,
                'code' => $this->costCenter?->code,
                'name' => $this->costCenter?->name,
            ]),
            'profit_center' => $this->whenLoaded('profitCenter', fn () => [
                'id' => $this->profitCenter?->id,
                'code' => $this->profitCenter?->code,
                'name' => $this->profitCenter?->name,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
