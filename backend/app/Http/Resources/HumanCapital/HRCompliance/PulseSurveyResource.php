<?php

namespace App\Http\Resources\HumanCapital\HRCompliance;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\HumanCapital\HRCompliance\SurveyResponseResource;

class PulseSurveyResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'             => $this->id,
            'title'          => $this->title,
            'description'    => $this->description,
            'status'         => $this->status, // 'active', 'inactive', 'concluded'
            'start_date'     => $this->start_date?->toDateTimeString(),
            'end_date'       => $this->end_date?->toDateTimeString(),
            'created_by'     => $this->created_by,
            'response_count' => (int) $this->responses_count,
            'responses'      => SurveyResponseResource::collection($this->whenLoaded('responses')),
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
