<?php

namespace App\Http\Resources\HumanCapital\HRCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class CorporateAnnouncementResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'content'      => $this->content,
            'priority'     => $this->priority, // 'normal', 'high', 'low'
            'target_type'  => $this->target_type, // 'all', 'department', 'role'
            'target_value' => $this->target_value,
            'status'       => $this->status, // 'draft', 'published', 'archived'
            'published_at' => $this->published_at?->toDateTimeString(),
            'expires_at'   => $this->expires_at?->toDateTimeString(),
            'created_by'   => $this->created_by,
            'author'       => $this->whenLoaded('author'),
            'created_at'   => $this->created_at?->toDateTimeString(),
            'updated_at'   => $this->updated_at?->toDateTimeString(),
        ];
    }
}
