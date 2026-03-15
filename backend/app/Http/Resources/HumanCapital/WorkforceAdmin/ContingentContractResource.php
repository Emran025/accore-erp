<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class ContingentContractResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'worker_id'           => $this->worker_id,
            'contract_number'     => $this->contract_number,
            'contract_start_date' => $this->contract_start_date?->toDateString(),
            'contract_end_date'   => $this->contract_end_date?->toDateString(),
            'status'              => $this->status,
            'contract_terms'      => $this->contract_terms ?? null,
            'file_path'           => $this->file_path ?? null,
            'total_value'         => (float) ($this->total_value ?? 0),
            'renewal_notes'       => $this->renewal_notes ?? null,
            'created_by'          => $this->created_by,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
