<?php

namespace App\Http\Resources\Commercial\MarketingDistribution;

use Illuminate\Http\Resources\Json\JsonResource;

class SalesRepresentativeTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                       => $this->id,
            'sales_representative_id'  => $this->sales_representative_id,
            'type'                     => $this->type,
            'voucher_number'           => $this->voucher_number,
            'description'              => $this->description,
            'reference_type'           => $this->reference_type,
            'reference_id'             => $this->reference_id,
            'transaction_date'         => $this->transaction_date?->toDateTimeString(),
            'created_by'               => $this->created_by,
            'creator_name'             => $this->createdBy?->username,
            'is_deleted'               => (bool) $this->is_deleted,
            'deleted_at'               => $this->when($this->deleted_at, fn () => $this->deleted_at?->toDateTimeString()),
            'created_at'               => $this->created_at?->toDateTimeString(),
        ];
    }
}
