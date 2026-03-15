<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeLoanResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'loan_number'           => $this->loan_number,
            'employee_id'           => $this->employee_id,
            'loan_type'             => $this->loan_type,
            'loan_amount'           => (float) $this->loan_amount,
            'interest_rate'         => (float) $this->interest_rate,
            'installment_count'     => (int) ($this->installment_count ?? 0),
            'monthly_installment'   => (float) $this->monthly_installment,
            'start_date'            => $this->start_date?->toDateString(),
            'end_date'              => $this->end_date?->toDateString(),
            'status'                => $this->status,
            'remaining_balance'     => (float) $this->remaining_balance,
            'auto_deduction'        => (bool) $this->auto_deduction,
            'deduction_component_id' => $this->deduction_component_id ?? null,
            'approved_by'           => $this->approved_by ?? null,
            'notes'                 => $this->notes ?? null,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
            'repayments'            => LoanRepaymentResource::collection($this->whenLoaded('repayments')),
        ];
    }
}
