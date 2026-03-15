<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentSequenceResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'document_type'  => $this->document_type,
            'prefix'         => $this->prefix,
            'current_number' => (int) $this->current_number,
            'format'         => $this->format,
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
