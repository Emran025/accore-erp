<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\HRAdvanced\Models\OnboardingDocument;

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
