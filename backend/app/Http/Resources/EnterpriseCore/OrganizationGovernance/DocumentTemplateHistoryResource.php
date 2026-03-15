<?php

namespace App\Http\Resources\EnterpriseCore\OrganizationGovernance;

use Illuminate\Http\Resources\Json\JsonResource;

class DocumentTemplateHistoryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id'                   => $this->id,
            'document_template_id' => $this->document_template_id,
            'version'              => $this->version,
            'template_content'     => $this->template_content,
            'changed_by'           => $this->changed_by,
            'change_notes'         => $this->change_notes,
            'created_at'           => $this->created_at?->toDateTimeString(),
        ];
    }
}
