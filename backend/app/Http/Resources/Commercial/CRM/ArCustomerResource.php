<?php

namespace App\Http\Resources\Commercial\CRM;

use Illuminate\Http\Resources\Json\JsonResource;

class ArCustomerResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'customer_code'   => $this->customer_code,
            'name'            => $this->name,
            'phone'           => $this->phone,
            'email'           => $this->email,
            'address'         => $this->address,
            'tax_number'      => $this->tax_number,
            'credit_limit'    => (float) ($this->credit_limit ?? 0),
            'payment_terms'   => (int) ($this->payment_terms ?? 0),
            'current_balance' => (float) $this->current_balance,
            'balance'         => (float) $this->current_balance,
            'total_debt'      => (float) ($this->total_debt ?? 0),
            'total_paid'      => (float) ($this->total_paid ?? 0),
            'is_active'       => (bool) ($this->is_active ?? true),
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
