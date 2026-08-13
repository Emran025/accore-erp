<?php

namespace App\Http\Resources\Finance\Treasury;

use Illuminate\Http\Resources\Json\JsonResource;

class RecurringTransactionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'type'                  => $this->type,
            'frequency'             => $this->frequency,
            'next_due_date'         => $this->next_due_date instanceof \DateTimeInterface ? $this->next_due_date->toDateString() : $this->next_due_date,
            'last_generated_date'   => $this->last_generated_date instanceof \DateTimeInterface ? $this->last_generated_date->toDateString() : $this->last_generated_date,
            'template_data'         => $this->template_data,
            'created_at'            => $this->created_at?->toDateTimeString(),
            'updated_at'            => $this->updated_at?->toDateTimeString(),
        ];
    }
}
