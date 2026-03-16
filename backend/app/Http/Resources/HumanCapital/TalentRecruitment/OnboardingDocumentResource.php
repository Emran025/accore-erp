<?php

namespace App\Http\Resources\HumanCapital\TalentRecruitment;

use Illuminate\Http\Resources\Json\JsonResource;

class OnboardingDocumentResource extends JsonResource
{
    public static $wrap = null;

    public function toArray($request): array
    {
        return [
            'id'                     => $this->id,
            'onboarding_workflow_id' => $this->onboarding_workflow_id,
            'document_name'          => $this->document_name,
            'document_type'          => $this->document_type,
            'file_path'              => $this->file_path,
            'status'                 => $this->status,
            'notes'                  => $this->notes,
            'created_at'             => $this->created_at?->toDateTimeString(),
            'updated_at'             => $this->updated_at?->toDateTimeString(),
        ];
    }
}
