<?php

namespace App\Http\Resources\HumanCapital\ServicesWellness;

use Illuminate\Http\Resources\Json\JsonResource;

class TravelExpenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                  => $this->id,
            'travel_request_id'   => $this->travel_request_id ?? null,
            'employee_id'         => $this->employee_id,
            'expense_type'        => $this->expense_type ?? null,
            'amount'              => (float) ($this->amount ?? 0),
            'currency'            => $this->currency ?? null,
            'expense_date'        => $this->expense_date?->toDateString() ?? $this->expense_date,
            'description'         => $this->description ?? null,
            'status'              => $this->status ?? null,
            'receipt_path'        => $this->receipt_path ?? null,
            'created_at'          => $this->created_at?->toDateTimeString(),
            'updated_at'          => $this->updated_at?->toDateTimeString(),
        ];
    }
}
