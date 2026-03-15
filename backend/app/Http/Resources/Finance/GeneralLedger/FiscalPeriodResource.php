<?php

namespace App\Http\Resources\Finance\GeneralLedger;

use Illuminate\Http\Resources\Json\JsonResource;

class FiscalPeriodResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'          => $this->id,
            'period_name' => $this->period_name,
            'start_date'  => $this->start_date?->toDateString(),
            'end_date'    => $this->end_date?->toDateString(),
            'is_closed'   => (bool) $this->is_closed,
            'is_locked'   => (bool) $this->is_locked,
            'closed_at'   => $this->closed_at?->toDateTimeString(),
            'locked_at'   => $this->locked_at?->toDateTimeString(),
            'closed_by'   => $this->closed_by,
            'locked_by'   => $this->locked_by,
        ];
    }
}
