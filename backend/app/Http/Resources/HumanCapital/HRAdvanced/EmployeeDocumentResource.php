<?php

namespace App\Http\Resources\HumanCapital\HRAdvanced;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeDocumentResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'employee_id'     => $this->employee_id,
            'document_type'   => $this->document_type,
            'document_name'   => $this->document_name,
            'document_number' => $this->document_number ?? null,
            'issue_date'      => $this->issue_date?->toDateString() ?? $this->issue_date,
            'expiration_date' => $this->expiration_date?->toDateString() ?? $this->expiration_date,
            'status'          => $this->status,
            'mime_type'       => $this->mime_type ?? null,
            'file_size'       => $this->file_size ?? null,
            'notes'           => $this->notes ?? null,
            'is_verified'     => (bool) ($this->is_verified ?? false),
            'verified_by'     => $this->verified_by ?? null,
            'verified_at'     => $this->verified_at?->toDateTimeString() ?? $this->verified_at,
            'uploaded_by'     => $this->uploaded_by,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
