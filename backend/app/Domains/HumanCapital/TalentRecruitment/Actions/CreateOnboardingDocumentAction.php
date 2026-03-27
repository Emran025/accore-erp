<?php

namespace App\Domains\HumanCapital\TalentRecruitment\Actions;

use App\Domains\HumanCapital\HRAdvanced\Models\OnboardingDocument;

class CreateOnboardingDocumentAction
{
    public function execute(int|string $workflowId, array $data): OnboardingDocument
    {
        $data['workflow_id'] = $workflowId;
        $data['status'] = 'pending';

        return OnboardingDocument::create($data);
    }
}
