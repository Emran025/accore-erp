<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\HumanCapital\TalentDevelopment\Models\ContinuousFeedback;

class CreateContinuousFeedbackAction
{
    public function execute(array $data): array
    {
        $data['given_by'] = auth()->id();
        $feedback = ContinuousFeedback::create($data);
        return $feedback->load('employee', 'givenBy')->toArray();
    }
}
