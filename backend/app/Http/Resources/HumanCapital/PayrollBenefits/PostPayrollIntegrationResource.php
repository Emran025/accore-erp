<?php

namespace App\Http\Resources\HumanCapital\PayrollBenefits;

use Illuminate\Http\Resources\Json\JsonResource;

class PostPayrollIntegrationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                => $this->id,
            'payroll_cycle_id'  => $this->payroll_cycle_id,
            'integration_type'  => $this->integration_type, // 'bank_file', 'gl_entry', etc.
            'status'            => $this->status,
            'total_amount'      => (float) $this->total_amount,
            'transaction_count' => (int) $this->transaction_count,
            'processed_at'      => $this->processed_at?->toDateTimeString(),
            'payroll_cycle'      => $this->whenLoaded('payrollCycle'),
            'created_at'        => $this->created_at?->toDateTimeString(),
            'updated_at'        => $this->updated_at?->toDateTimeString(),
        ];
    }
}
