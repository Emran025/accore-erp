<?php

namespace App\Domains\HumanCapital\TalentAcquisition\Actions;

use App\Domains\HumanCapital\DocumentManagement\Models\OnboardingDocument;

class CreateOnboardingDocumentAction
{
    public function execute(int|string $workflowId, array $data): array
    {
        $data['workflow_id'] = $workflowId;
        $data['status'] = 'pending';

        $document = OnboardingDocument::create($data);
        return $document->toArray();
    }
}
