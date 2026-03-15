<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class ContingentWorkerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'worker_code'           => $this->worker_code,
            'full_name'             => $this->full_name,
            'email'                 => $this->email,
            'phone'                 => $this->phone,
            'worker_type'           => $this->worker_type,
            'company_name'          => $this->company_name ?? null,
            'sow_number'            => $this->sow_number ?? null,
            'start_date'            => $this->start_date?->toDateString(),
            'end_date'              => $this->end_date?->toDateString(),
            'status'                => $this->status,
            'service_description'   => $this->service_description ?? null,
            'hourly_rate'           => (float) ($this->hourly_rate ?? 0),
            'monthly_rate'          => (float) ($this->monthly_rate ?? 0),
            'has_insurance'         => (bool) $this->has_insurance,
            'badge_expiry'          => $this->badge_expiry?->toDateString(),
            'system_access_expiry'  => $this->system_access_expiry?->toDateString(),
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'contracts'             => ContingentContractResource::collection($this->whenLoaded('contracts')),
        ];
    }
}
