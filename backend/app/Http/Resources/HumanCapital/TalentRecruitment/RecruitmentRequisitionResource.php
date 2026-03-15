<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentRequisitionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                       => $this->id,
            'requisition_number'       => $this->requisition_number,
            'job_title'                => $this->job_title,
            'job_description'          => $this->job_description ?? null,
            'department_id'            => $this->department_id,
            'role_id'                  => $this->role_id ?? null,
            'number_of_positions'      => (int) ($this->number_of_positions ?? 1),
            'employment_type'          => $this->employment_type,
            'budgeted_salary_min'      => (float) ($this->budgeted_salary_min ?? 0),
            'budgeted_salary_max'      => (float) ($this->budgeted_salary_max ?? 0),
            'status'                   => $this->status,
            'target_start_date'        => $this->target_start_date?->toDateString(),
            'required_qualifications'  => $this->required_qualifications ?? null,
            'preferred_qualifications' => $this->preferred_qualifications ?? null,
            'is_published'             => (bool) ($this->is_published ?? false),
            'requested_by'             => $this->requested_by ?? null,
            'approved_by'              => $this->approved_by ?? null,
            'approved_at'              => $this->approved_at?->toDateTimeString(),
            'rejection_reason'         => $this->rejection_reason ?? null,
            'notes'                    => $this->notes ?? null,
            'created_at'               => $this->created_at?->toDateTimeString(),
            'updated_at'               => $this->updated_at?->toDateTimeString(),
        ];
    }
}
