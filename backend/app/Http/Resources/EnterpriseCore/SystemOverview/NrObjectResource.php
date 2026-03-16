<?php

namespace App\Http\Resources\EnterpriseCore\SystemOverview;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
class NrObjectResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        // Check if we have the model or the enriched array from the service
        $isModel = $this->resource instanceof NrObject;

        $data = [
            'id'            => $this->id,
            'object_type'   => $this->object_type,
            'name'          => $this->name,
            'name_en'       => $this->name_en,
            'description'   => $this->description,
            'number_length' => $this->number_length,
            'prefix'        => $this->prefix,
            'is_active'     => (bool) $this->is_active,
            'created_at'    => $this->created_at instanceof \DateTime ? $this->created_at->toDateTimeString() : $this->created_at,
            'groups_count'  => $this->groups_count,
            'intervals_count' => $this->intervals_count,
            'assignments_count' => $this->assignments_count,
        ];

        if ($isModel) {
            $data['groups'] = NrGroupResource::collection($this->whenLoaded('groups'));
            $data['intervals'] = NrIntervalResource::collection($this->whenLoaded('intervals'));
            $data['assignments'] = NrAssignmentResource::collection($this->whenLoaded('assignments'));
            
            // To match the frontend expected NrObjectFull interface:
            if ($this->relationLoaded('groups') && $this->relationLoaded('intervals')) {
                $totalCapacity = $this->intervals->sum('capacity');
                $totalUsed = $this->intervals->sum('used');
                $totalRemaining = $totalCapacity - $totalUsed;
                
                $data['summary'] = [
                    'total_groups'     => $this->groups->count(),
                    'total_intervals'  => $this->intervals->count(),
                    'total_assignments'=> $this->relationLoaded('assignments') ? $this->assignments->count() : 0,
                    'total_capacity'   => $totalCapacity,
                    'total_used'       => $totalUsed,
                    'total_remaining'  => $totalRemaining,
                    'overall_fullness' => $totalCapacity > 0 ? round(($totalUsed / $totalCapacity) * 100, 2) : 0,
                ];
            }
        } else {
            // Enhanced array from service
            $data['groups'] = $this->resource['groups'] ?? [];
            $data['intervals'] = $this->resource['intervals'] ?? [];
            $data['assignments'] = $this->resource['assignments'] ?? [];
            $data['summary'] = $this->resource['summary'] ?? null;
        }

        return $data;
    }
}
