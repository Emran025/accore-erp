<?php

namespace App\Http\Resources\HumanCapital\TimeProductivity;

use Illuminate\Http\Resources\Json\JsonResource;

class BiometricSyncLogResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'device_id'      => $this->device_id,
            'status'         => $this->status, // 'success', 'failed', 'partial'
            'imported_count' => (int) $this->imported_count,
            'failed_count'   => (int) $this->failed_count,
            'log_message'    => $this->log_message,
            'sync_time'      => $this->sync_time?->toDateTimeString(),
            'initiator_id'   => $this->initiator_id,
            'device'         => $this->whenLoaded('device'),
            'initiator'      => $this->whenLoaded('initiator'),
            'created_at'     => $this->created_at?->toDateTimeString(),
        ];
    }
}
