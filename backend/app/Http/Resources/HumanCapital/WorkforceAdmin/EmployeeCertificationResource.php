<?php

namespace App\Http\Resources\HumanCapital\WorkforceAdmin;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeCertificationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'employee_id'      => $this->employee_id,
            'certification_name' => $this->certification_name ?? $this->name ?? null,
            'issuing_body'     => $this->issuing_body ?? null,
            'issue_date'       => $this->issue_date?->toDateString() ?? $this->issue_date,
            'expiry_date'      => $this->expiry_date?->toDateString() ?? $this->expiry_date,
            'status'           => $this->status ?? null,
            'file_path'        => $this->file_path ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
