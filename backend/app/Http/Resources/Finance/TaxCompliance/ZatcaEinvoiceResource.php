<?php

namespace App\Http\Resources\Finance\TaxCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class ZatcaEinvoiceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'invoice_id'   => $this->invoice_id,
            'zatca_uuid'   => $this->zatca_uuid,
            'status'       => $this->status,
            'hash'         => $this->hash,
            'qr_code'      => $this->qr_code,
            'zatca_qr_code' => $this->zatca_qr_code,
            'signed_at'    => $this->signed_at?->toDateTimeString(),
            'submitted_at' => $this->submitted_at?->toDateTimeString(),
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
