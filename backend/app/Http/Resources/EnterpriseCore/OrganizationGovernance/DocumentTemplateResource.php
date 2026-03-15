<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTemplateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'document_type'    => $this->document_type,
            'template_content' => $this->template_content,
            'variables'        => $this->variables,
            'is_active'        => (bool) ($this->is_active ?? true),
            'created_by'       => $this->created_by,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'history'          => DocumentTemplateHistoryResource::collection($this->whenLoaded('history')),
        ];
    }
}
