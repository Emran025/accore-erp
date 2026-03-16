<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class PayrollCycleResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                 => $this->id,
            'cycle_name'         => $this->cycle_name,
            'period_start'       => $this->period_start?->toDateString() ?? $this->period_start,
            'period_end'         => $this->period_end?->toDateString() ?? $this->period_end,
            'pay_date'           => $this->pay_date?->toDateString() ?? $this->pay_date,
            'status'             => $this->status,
            'total_gross'        => (float) ($this->total_gross ?? 0),
            'total_deductions'   => (float) ($this->total_deductions ?? 0),
            'total_net'          => (float) ($this->total_net ?? 0),
            'employee_count'     => (int) ($this->employee_count ?? 0),
            'approved_by'        => $this->approved_by ?? null,
            'approved_at'        => $this->approved_at?->toDateTimeString() ?? $this->approved_at,
            'created_by'         => $this->created_by ?? null,
            'created_at'         => $this->created_at?->toDateTimeString(),
            'updated_at'         => $this->updated_at?->toDateTimeString(),
        ];
    }
}
