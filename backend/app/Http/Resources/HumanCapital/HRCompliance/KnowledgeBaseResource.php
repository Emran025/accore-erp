<?php

namespace App\Http\Resources\HumanCapital\HRCompliance;

use Illuminate\Http\Resources\Json\JsonResource;

class KnowledgeBaseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'slug'          => $this->slug,
            'content'       => $this->content,
            'category_id'   => $this->category_id,
            'tags'          => $this->tags,
            'is_published'  => (bool) $this->is_published,
            'helpful_count' => (int) $this->helpful_count,
            'views_count'   => (int) $this->views_count,
            'created_at'    => $this->created_at?->toDateTimeString(),
            'updated_at'    => $this->updated_at?->toDateTimeString(),
        ];
    }
}
