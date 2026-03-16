<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class CompensationEntryResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'compensation_plan_id' => $this->compensation_plan_id,
            'employee_id'          => $this->employee_id,
            'amount'               => (float) $this->amount,
            'status'               => $this->status, // 'pending', 'approved', 'processed', 'rejected'
            'reason'               => $this->reason,
            'effective_date'       => $this->effective_date?->toDateTimeString(),
            'employee'             => $this->whenLoaded('employee'),
            'plan'                 => $this->whenLoaded('plan'),
            'created_at'           => $this->created_at?->toDateTimeString(),
            'updated_at'           => $this->updated_at?->toDateTimeString(),
        ];
    }
}
