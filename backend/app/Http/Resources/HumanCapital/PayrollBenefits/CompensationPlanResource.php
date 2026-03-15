<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class CompensationPlanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'plan_name'        => $this->plan_name,
            'plan_type'        => $this->plan_type,
            'fiscal_year'      => $this->fiscal_year,
            'effective_date'   => $this->effective_date?->toDateString(),
            'status'           => $this->status,
            'budget_pool'      => (float) $this->budget_pool,
            'allocated_amount' => (float) $this->allocated_amount,
            'notes'            => $this->notes ?? null,
            'created_by'       => $this->created_by,
            'approved_by'      => $this->approved_by ?? null,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
