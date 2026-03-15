<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'user_name'   => $this->user ? $this->user->name : 'Unknown',
            'action'      => strtolower($this->operation),
            'module'      => $this->table_name,
            'record_id'   => $this->record_id,
            'description' => ucfirst(strtolower($this->operation)) . " operation on " . ucfirst($this->table_name) . " regarding record ID $this->record_id",
            'old_values'  => $this->old_values,
            'new_values'  => $this->new_values,
            'ip_address'  => $this->ip_address,
            'user_agent'  => $this->user_agent,
            'created_at'  => $this->created_at?->toDateTimeString(),
        ];
    }
}
