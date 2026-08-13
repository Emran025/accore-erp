<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTemplateResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->template_name_en,
            'document_type'    => $this->template_type,
            'template_content' => $this->body_html,
            'variables'        => $this->editable_fields,
            'template_key'     => $this->template_key,
            'template_name_ar' => $this->template_name_ar,
            'template_name_en' => $this->template_name_en,
            'template_type'    => $this->template_type,
            'body_html'        => $this->body_html,
            'editable_fields'  => $this->editable_fields,
            'description'      => $this->description,
            'is_active'        => (bool) ($this->is_active ?? true),
            'created_by'       => $this->created_by,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
            'history'          => DocumentTemplateHistoryResource::collection($this->whenLoaded('history')),
        ];
    }
}
