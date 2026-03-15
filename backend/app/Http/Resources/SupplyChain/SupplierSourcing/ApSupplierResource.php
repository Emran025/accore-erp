<?php

namespace App\Http\Resources\SupplyChain\SupplierSourcing;

use Illuminate\Http\Resources\Json\JsonResource;

class ApSupplierResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'              => $this->id,
            'supplier_code'   => $this->supplier_code,
            'name'            => $this->name,
            'phone'           => $this->phone,
            'email'           => $this->email,
            'address'         => $this->address,
            'tax_number'      => $this->tax_number,
            'credit_limit'    => (float) ($this->credit_limit ?? 0),
            'payment_terms'   => (int) $this->payment_terms,
            'current_balance' => (float) $this->current_balance,
            'created_at'      => $this->created_at?->toDateTimeString(),
            'updated_at'      => $this->updated_at?->toDateTimeString(),
        ];
    }
}
